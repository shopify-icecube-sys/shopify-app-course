import {
    Page,
    Card,
    Text,
    BlockStack,
    Box,
    InlineGrid,
    Layout,
} from "@shopify/polaris";
import type { LoaderFunctionArgs, HeadersFunction } from "react-router";
import { useLoaderData, useRouteError } from "react-router";
import { authenticate } from "../shopify.server";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { NavigationTabs } from "../components/NavigationTabs";

export const loader = async ({ request }: LoaderFunctionArgs) => {
    const { admin } = await authenticate.admin(request);

    const response = await admin.graphql(
        `#graphql
    query getProductPrices {
      products(first: 250) {
        edges {
          node {
            variants(first: 100) {
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
    const products = responseJson.data?.products?.edges || [];

    let totalProducts = 0;
    let totalPriceSum = 0;
    let totalVariantCount = 0;

    products.forEach((edge: any) => {
        totalProducts++;
        edge.node.variants.edges.forEach((vEdge: any) => {
            totalPriceSum += parseFloat(vEdge.node.price);
            totalVariantCount++;
        });
    });

    const averagePrice = totalVariantCount > 0 ? totalPriceSum / totalVariantCount : 0;

    const formattedAveragePrice = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
    }).format(averagePrice);

    return {
        stats: {
            averagePrice: formattedAveragePrice,
            productCount: totalProducts
        }
    };
};

export default function AnalyticsPage() {
    const { stats } = useLoaderData<typeof loader>();

    return (
        <Page title="Analytics">
            <NavigationTabs />

            <Box paddingBlockStart="400">
                <Layout>
                    <Layout.Section>
                        <Card>
                            <BlockStack gap="400">
                                <Text as="h2" variant="headingMd">
                                    Analytics
                                </Text>
                                <InlineGrid columns={{ xs: 1, sm: 2 }} gap="400">
                                    <Box
                                        padding="400"
                                        borderWidth="025"
                                        borderColor="border-secondary"
                                        borderRadius="200"
                                    >
                                        <BlockStack gap="200">
                                            <Text as="p" variant="bodyMd" fontWeight="bold">Average Price</Text>
                                            <Text as="p" variant="heading2xl" fontWeight="bold">
                                                {stats.averagePrice}
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
                                            <Text as="p" variant="bodyMd" fontWeight="bold">Product Count</Text>
                                            <Text as="p" variant="heading2xl" fontWeight="bold">
                                                {stats.productCount}
                                            </Text>
                                        </BlockStack>
                                    </Box>
                                </InlineGrid>
                            </BlockStack>
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
