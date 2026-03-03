import { useEffect, useState, useCallback } from "react";
import QRCode from "qrcode";
import "@shopify/polaris/build/esm/styles.css";
import type {
  ActionFunctionArgs,
  HeadersFunction,
  LoaderFunctionArgs,
} from "react-router";
import { useFetcher, useLoaderData } from "react-router";
import { useAppBridge } from "@shopify/app-bridge-react";
import { Card, Layout, Page, Text, BlockStack, InlineGrid, Box, Divider, TextField, Button, InlineStack } from "@shopify/polaris";
import { authenticate } from "../shopify.server";
import { boundary } from "@shopify/shopify-app-react-router/server";

// --- Components ---
import { StatCard } from "../components/StatCard";
import { ActivityFeed } from "../components/ActivityFeed";
import { ProductForm } from "../components/ProductForm";
import { ProductList, type Product } from "../components/ProductList";
import { NavigationTabs } from "../components/NavigationTabs";

// --- 1. LOADER: Fetches existing products from Shopify when the page loads ---
export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { admin } = await authenticate.admin(request);

  const response = await admin.graphql(
    `#graphql
    query getProducts {
      products(first: 50, reverse: true) {
        edges {
          node {
            id
            title
            description
            tags
            variants(first: 1) {
              edges {
                node {
                  price
                }
              }
            }
          }
        }
      }
    }`
  );

  const responseJson = await response.json() as any;

  if (responseJson.errors) {
    console.error("GraphQL Errors:", responseJson.errors);
  }

  const totalProductsCount = responseJson.data?.products?.edges?.length || 0;
  const allProducts = responseJson.data?.products?.edges || [];

  const responseOrders = await admin.graphql(
    `#graphql
    query getOrders {
      orders(first: 100) {
        edges {
          node {
            totalPriceSet {
              shopMoney {
                amount
                currencyCode
              }
            }
            displayFinancialStatus
            displayFulfillmentStatus
          }
        }
      }
    }`
  );

  const ordersJson = await responseOrders.json() as any;
  const orders = ordersJson.data?.orders?.edges || [];

  // Calculate Total Revenue by summing all orders
  const totalRevenue = orders.reduce((sum: number, edge: any) => {
    return sum + parseFloat(edge.node.totalPriceSet.shopMoney.amount);
  }, 0);

  // Define Active Orders as those that are open and not fully fulfilled
  const activeOrdersCount = orders.filter((edge: any) => {
    return edge.node.displayFulfillmentStatus !== "FULFILLED";
  }).length;

  const currencyCode = orders.length > 0
    ? orders[0].node.totalPriceSet.shopMoney.currencyCode
    : "USD";

  const formattedRevenue = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currencyCode,
  }).format(totalRevenue);

  // Filter in JavaScript instead of GraphQL query to avoid search indexing delays (Shopify search can be slow to update)
  // This ensures that products show up immediately after a page refresh.
  const appProducts = allProducts
    .filter((edge: any) => edge.node.tags.includes("app-created-by-my-app"))
    .map((edge: any) => ({
      id: edge.node.id,
      name: edge.node.title,
      price: edge.node.variants.edges[0]?.node.price || "0.00",
      description: edge.node.description,
    }));

  console.log(`Matched ${appProducts.length} app-specific products out of ${allProducts.length} total products.`);

  return {
    initialProducts: appProducts,
    stats: {
      totalProducts: totalProductsCount,
      totalRevenue: formattedRevenue,
      activeOrders: activeOrdersCount
    }
  };
};

// --- 2. ACTION: Handles backend tasks like Creating and Deleting products ---
export const action = async ({ request }: ActionFunctionArgs) => {
  const { admin } = await authenticate.admin(request);
  if (request.method === "DELETE") {
    // Handle Product Deletion
    const formData = await request.formData();
    const productId = formData.get("id") as string;

    const response = await admin.graphql(
      `#graphql
      mutation productDelete($input: ProductDeleteInput!) {
        productDelete(input: $input) {
          deletedProductId
          userErrors {
            field
            message
          }
        }
      }`,
      {
        variables: {
          input: {
            id: productId,
          },
        },
      },
    );

    return await response.json();
  }

  // Handle Product Creation logic
  const formData = await request.formData();
  const tempId = formData.get("tempId") as string;
  const productName = formData.get("productName") as string;
  const price = formData.get("price") as string;
  const description = formData.get("description") as string;

  // Step 1: Create the product
  const createResponse = await admin.graphql(
    `#graphql
      mutation productCreate($product: ProductCreateInput!) {
        productCreate(product: $product) {
          product {
            id
            title
            description
            variants(first: 1) {
              edges {
                node {
                  id
                }
              }
            }
          }
          userErrors {
            field
            message
          }
        }
      }`,
    {
      variables: {
        product: {
          title: productName,
          descriptionHtml: description,
          tags: ["app-created-by-my-app"],
        },
      },
    },
  );

  const createJson = await createResponse.json() as any;

  if (createJson.data?.productCreate?.userErrors?.length > 0) {
    return {
      error: createJson.data.productCreate.userErrors[0].message,
      tempId
    };
  }

  const product = createJson.data!.productCreate!.product!;
  const variantId = product.variants.edges[0]?.node?.id;

  // Step 2: Update the variant's price if we have a variant ID
  if (variantId && price) {
    await admin.graphql(
      `#graphql
      mutation productVariantsBulkUpdate($productId: ID!, $variants: [ProductVariantsBulkInput!]!) {
        productVariantsBulkUpdate(productId: $productId, variants: $variants) {
          userErrors {
            field
            message
          }
        }
      }`,
      {
        variables: {
          productId: product.id,
          variants: [{ id: variantId, price: price }],
        },
      },
    );
  }

  return {
    product: {
      id: product.id,
      title: product.title,
      description: product.description
    },
    tempId
  };
};


// --- 3. MAIN COMPONENT: The Dashboard UI and Client-side logic ---
export default function Index() {
  const { initialProducts, stats } = useLoaderData<typeof loader>();
  const shopify = useAppBridge();
  const fetcher = useFetcher<typeof action>();
  // Form State: Tracks user input in real-time
  const [productName, setProductName] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");

  // QR Generator State
  const [targetUrl, setTargetUrl] = useState("https://blackbytt.com");
  const [label, setLabel] = useState("Scan to explore BlackBytt");
  const [size, setSize] = useState("200");
  const [foreground, setForeground] = useState("#0b0d17");
  const [background, setBackground] = useState("#ffffff");
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>("");

  const generateQRCode = useCallback(async () => {
    try {
      const url = await QRCode.toDataURL(targetUrl, {
        width: parseInt(size),
        color: {
          dark: foreground,
          light: background,
        },
        margin: 1,
      });
      setQrCodeDataUrl(url);
    } catch (err) {
      console.error(err);
    }
  }, [targetUrl, size, foreground, background]);

  useEffect(() => {
    generateQRCode();
  }, [generateQRCode]);

  // Products State: The list being displayed on the dashboard
  const [products, setProducts] = useState<Product[]>(initialProducts);

  const handleProductNameChange = useCallback((value: string) => setProductName(value), []);
  const handlePriceChange = useCallback((value: string) => setPrice(value), []);
  const handleDescriptionChange = useCallback((value: string) => setDescription(value), []);

  // HANDLER: Triggered when "Add Product" is clicked
  const handleSubmit = useCallback((event?: React.FormEvent) => {
    if (event) event.preventDefault();

    // Basic Validation
    if (!productName.trim()) {
      shopify.toast.show("Please enter a product name", { isError: true });
      return;
    }

    const tempId = Date.now().toString(); // Unique temporary ID
    const newProduct: Product = {
      id: tempId,
      name: productName,
      price: price || "0.00",
      description,
    };

    setProducts((prevProducts) => [...prevProducts, newProduct]);

    // Pass tempId to the action so the response can be mapped back accurately
    fetcher.submit(
      { productName, price, description, tempId },
      { method: "POST" }
    );

    setProductName("");
    setPrice("");
    setDescription("");
  }, [productName, price, description, fetcher, shopify]);

  // HANDLER: Triggered when "Remove" is clicked on a product card
  const handleRemoveProduct = useCallback((id: string) => {
    // 1. Remove from local list for immediate UI feedback
    setProducts((prevProducts) => prevProducts.filter((product) => product.id !== id));

    // 2. If it's a real Shopify ID (starts with gid://), send delete request to backend
    if (id.startsWith("gid://shopify/Product/")) {
      fetcher.submit(
        { id },
        { method: "DELETE" }
      );
    }
  }, [fetcher]);

  const isLoading =
    ["loading", "submitting"].includes(fetcher.state) &&
    fetcher.formMethod === "POST";

  // EFFECT: Synchronizes Shopify's real IDs with our local "Optimistic" list
  useEffect(() => {
    if (fetcher.data) {
      const data = fetcher.data as any;

      if (data.error) {
        shopify.toast.show(data.error, { isError: true });
        // Optional: Remove the failed product from state or mark it as failed
        if (data.tempId) {
          setProducts((prev) => prev.filter(p => p.id !== data.tempId));
        }
        return;
      }

      // If we just created a product, update the specific local ID with the real Shopify ID
      if (data.product?.id && data.tempId) {
        setProducts((prev) =>
          prev.map((p) => (p.id === data.tempId ? { ...p, id: data.product.id } : p))
        );
        shopify.toast.show("Product created");
      }

      // If we just deleted a product
      if (data.data?.productDelete?.deletedProductId) {
        shopify.toast.show("Product deleted");
      }
    }
  }, [fetcher.data, shopify]);

  // Sync state with loader data when it changes (e.g., after a refresh or revalidation)
  useEffect(() => {
    setProducts(initialProducts);
  }, [initialProducts]);

  const generateProduct = () => fetcher.submit({}, { method: "POST" });

  return (
    <Page title="Dashboard">
      <NavigationTabs />
      <Box paddingBlockStart="400">
        <BlockStack gap="400">
          <BlockStack gap="200">
            <Text as="p" variant="bodyMd">
              Dashboard. This page is ready
            </Text>
            <Text as="h1" variant="headingXl">
              Dashboard
            </Text>
          </BlockStack>

          <Layout>
            <Layout.Section>
              <Card>
                <BlockStack gap="400">
                  <Text as="h2" variant="headingMd">
                    Overview
                  </Text>
                  <InlineGrid columns={{ xs: 1, md: 3 }} gap="400">
                    <Box
                      padding="400"
                      borderWidth="025"
                      borderColor="border-secondary"
                      borderRadius="200"
                    >
                      <BlockStack gap="200">
                        <Text as="p" variant="bodyMd" fontWeight="bold">Total Products</Text>
                        <Text as="p" variant="headingXl" fontWeight="bold">
                          {stats.totalProducts}
                        </Text>
                      </BlockStack>
                    </Box>
                    <Box
                      padding="400"
                      borderWidth="025"
                      borderColor="border-secondary"
                      borderRadius="200"
                    >
                      <BlockStack gap="200">
                        <Text as="p" variant="bodyMd" fontWeight="bold">Total Revenue</Text>
                        <Text as="p" variant="headingXl" fontWeight="bold">
                          {stats.totalRevenue}
                        </Text>
                      </BlockStack>
                    </Box>
                    <Box
                      padding="400"
                      borderWidth="025"
                      borderColor="border-secondary"
                      borderRadius="200"
                    >
                      <BlockStack gap="200">
                        <Text as="p" variant="bodyMd" fontWeight="bold">Active Orders</Text>
                        <Text as="p" variant="headingXl" fontWeight="bold">
                          {stats.activeOrders}
                        </Text>
                      </BlockStack>
                    </Box>
                  </InlineGrid>
                </BlockStack>
              </Card>
            </Layout.Section>

            <Layout.Section>
              <Box paddingBlockStart="400" paddingBlockEnd="400">
                <Divider />
              </Box>
            </Layout.Section>

            {/* QR Generator Sections */}
            <Layout.Section>
              <Card>
                <BlockStack gap="500">
                  <Text as="h2" variant="headingMd">
                    Customize your QR code
                  </Text>
                  <BlockStack gap="400">
                    <TextField
                      label="Target URL or text"
                      value={targetUrl}
                      onChange={setTargetUrl}
                      autoComplete="off"
                    />
                    <TextField
                      label="Label (optional)"
                      value={label}
                      onChange={setLabel}
                      autoComplete="off"
                    />
                    <TextField
                      label="Size (px)"
                      type="number"
                      value={size}
                      onChange={setSize}
                      autoComplete="off"
                    />
                    <TextField
                      label="Foreground"
                      value={foreground}
                      onChange={setForeground}
                      autoComplete="off"
                    />
                    <TextField
                      label="Background"
                      value={background}
                      onChange={setBackground}
                      autoComplete="off"
                    />
                    <Box paddingBlockStart="200">
                      <Button variant="primary" onClick={generateQRCode}>
                        Generate QR
                      </Button>
                    </Box>
                  </BlockStack>
                </BlockStack>
              </Card>
            </Layout.Section>

            <Layout.Section variant="oneThird">
              <Card>
                <BlockStack gap="400">
                  <Text as="h2" variant="headingMd">
                    Preview
                  </Text>
                  <Box padding="400" background="bg-surface-secondary" borderRadius="200">
                    <BlockStack align="center" gap="400">
                      <div
                        style={{
                          width: "200px",
                          height: "200px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          backgroundColor: "white",
                          borderRadius: "var(--p-border-radius-200)",
                          padding: "10px",
                          overflow: "hidden"
                        }}
                      >
                        {qrCodeDataUrl ? (
                          <img
                            src={qrCodeDataUrl}
                            alt="QR Code"
                            style={{ maxWidth: "100%", height: "auto" }}
                          />
                        ) : (
                          <Text as="span" variant="bodySm" tone="subdued">Generating...</Text>
                        )}
                      </div>
                      <Text as="p" variant="bodySm" alignment="center" tone="subdued">
                        {label || "Scan to explore BlackBytt"}
                      </Text>
                    </BlockStack>
                  </Box>
                  <BlockStack gap="200">
                    <Button fullWidth onClick={() => window.open(qrCodeDataUrl, '_blank')}>Download PNG</Button>
                    <Button fullWidth onClick={() => typeof navigator !== 'undefined' && navigator.clipboard.writeText(qrCodeDataUrl)}>Copy data URL</Button>
                  </BlockStack>
                </BlockStack>
              </Card>
            </Layout.Section>

            <Layout.Section>
              <Box paddingBlockStart="400" paddingBlockEnd="400">
                <Divider />
              </Box>
              <ActivityFeed />
            </Layout.Section>

            <Layout.Section>
              <ProductForm
                productName={productName}
                price={price}
                description={description}
                onProductNameChange={handleProductNameChange}
                onPriceChange={handlePriceChange}
                onDescriptionChange={handleDescriptionChange}
                onSubmit={handleSubmit}
              />
            </Layout.Section>

            <Layout.Section>
              <ProductList products={products} onRemove={handleRemoveProduct} />
            </Layout.Section>
          </Layout>
        </BlockStack>
      </Box>
    </Page>
  );
}

export const headers: HeadersFunction = (headersArgs) => {
  return boundary.headers(headersArgs);
};
