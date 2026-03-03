import {
    Page,
    Layout,
    Card,
    Box,
    IndexTable,
    Thumbnail,
    Text,
    Divider,
    BlockStack,
} from "@shopify/polaris";
import type { LoaderFunctionArgs, HeadersFunction } from "react-router";
import { useLoaderData, useRouteError } from "react-router";
import { authenticate } from "../shopify.server";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { NavigationTabs } from "../components/NavigationTabs";
import { ImageIcon } from "@shopify/polaris-icons";

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
            handle
            featuredImage {
              url
              altText
            }
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

    const responseJson = await response.json();
    const products = responseJson.data?.products?.edges || [];

    return { products };
};

export default function StoreProductsPage() {
    const { products } = useLoaderData<typeof loader>();

    const resourceName = {
        singular: "product",
        plural: "products",
    };

    const rowMarkup = products.map(
        ({ node }: any, index: number) => (
            <IndexTable.Row id={node.id} key={node.id} position={index}>
                <IndexTable.Cell>
                    <Thumbnail
                        source={node.featuredImage?.url || ImageIcon}
                        alt={node.featuredImage?.altText || node.title}
                    />
                </IndexTable.Cell>
                <IndexTable.Cell>
                    <Text as="span" variant="bodyMd" fontWeight="bold">
                        {node.title}
                    </Text>
                </IndexTable.Cell>
                <IndexTable.Cell>{node.variants.edges[0]?.node.price || "0.00"}</IndexTable.Cell>
                <IndexTable.Cell>{node.handle}</IndexTable.Cell>
            </IndexTable.Row>
        )
    );

    return (
        <Page title="Store Products">
            <NavigationTabs />
            <Box paddingBlockStart="400">
                <Layout>
                    <Layout.Section>
                        <Card padding="0">
                            <Box padding="400">
                                <Text as="h2" variant="headingMd">
                                    Store Products
                                </Text>
                            </Box>
                            <Divider />
                            <IndexTable
                                resourceName={resourceName}
                                itemCount={products.length}
                                headings={[
                                    { title: "" },
                                    { title: "Product" },
                                    { title: "Price" },
                                    { title: "Handle" },
                                ]}
                                selectable={false}
                            >
                                {rowMarkup}
                            </IndexTable>
                            {products.length === 0 && (
                                <Box padding="1000">
                                    <BlockStack align="center" gap="200">
                                        <Text as="p" alignment="center" tone="subdued">
                                            No products found in your shop.
                                        </Text>
                                    </BlockStack>
                                </Box>
                            )}
                        </Card>
                    </Layout.Section>
                </Layout>
            </Box>
        </Page>
    );
}

export const headers: HeadersFunction = (headersArgs) => {
    return boundary.headers(headersArgs);
};

export function ErrorBoundary() {
    return boundary.error(useRouteError());
}
