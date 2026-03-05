import {
    Page,
    Layout,
    Card,
    BlockStack,
    Text,
    Button,
    InlineStack,
    Box,
} from "@shopify/polaris";
import { authenticate } from "../shopify.server";
import prisma from "../db.server";
import { useLoaderData, useFetcher } from "react-router";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";

export const loader = async ({ request }: LoaderFunctionArgs) => {
    const { session } = await authenticate.admin(request);

    // We can fetch initial state from the database here if needed
    const merchant = await prisma.merchant.findUnique({
        where: { shop: session.shop }
    });

    return { shop: session.shop, isLabelEnabled: false }; // You can replace isLabelEnabled with DB state
};

export const action = async ({ request }: ActionFunctionArgs) => {
    const { session } = await authenticate.admin(request);
    const formData = await request.formData();
    const actionType = formData.get("actionType");

    if (actionType === "enable_label") {
        // Logic to update DB that label is enabled
        return { success: true, action: "enable_label" };
    }

    if (actionType === "create_label") {
        // Logic to start label creation process
        return { success: true, action: "create_label" };
    }

    return { success: false };
};

export default function Home() {
    const { shop } = useLoaderData<typeof loader>();
    const fetcher = useFetcher();

    return (
        <Page title="Launch on-brand Shopify badges in three simple steps.">
            <BlockStack gap="400">
                <Text as="p" variant="bodyMd" tone="subdued">
                    Use the checklist below to integrate, design, and publish without leaving your admin.
                </Text>

                <Layout>
                    {/* Step 1 Card */}
                    <Layout.Section variant="oneHalf">
                        <Card padding="0">
                            {/* Top Banner section */}
                            <div style={{ backgroundColor: "#FCE72A", padding: "16px", borderTopLeftRadius: "8px", borderTopRightRadius: "8px" }}>
                                <Box padding="400" background="bg-surface" borderRadius="200">
                                    <InlineStack align="space-between" blockAlign="center">
                                        <InlineStack gap="400" blockAlign="center">
                                            <div style={{ width: 40, height: 40, backgroundColor: "#7B61FF", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                                <span style={{ color: "white", fontSize: "20px" }}>🛒</span>
                                            </div>
                                            <BlockStack gap="050">
                                                <Text as="h3" variant="headingSm" fontWeight="bold">Black Bytt Labels</Text>
                                                <Text as="p" variant="bodySm" tone="subdued">Blackbytt labels</Text>
                                            </BlockStack>
                                        </InlineStack>
                                        <div style={{ width: 40, height: 24, backgroundColor: "black", borderRadius: 12, display: "flex", alignItems: "center", padding: 2, justifyContent: "flex-end" }}>
                                            <div style={{ width: 20, height: 20, backgroundColor: "white", borderRadius: "50%" }}></div>
                                        </div>
                                    </InlineStack>
                                </Box>
                            </div>

                            {/* Bottom Content section */}
                            <Box padding="400">
                                <BlockStack gap="400">
                                    <BlockStack gap="200">
                                        <Text as="h3" variant="headingMd" fontWeight="bold">
                                            Step 1: Integrate our app.
                                        </Text>
                                        <Text as="p" variant="bodyMd" tone="subdued">
                                            To enter the Theme Editor page, click the "Enabled app embed" button below, then activate our app and click "Save".
                                        </Text>
                                    </BlockStack>
                                    <InlineStack>
                                        <fetcher.Form method="post">
                                            <input type="hidden" name="actionType" value="enable_label" />
                                            <Button variant="primary" tone="critical" submit>
                                                Enable Label
                                            </Button>
                                        </fetcher.Form>
                                    </InlineStack>
                                </BlockStack>
                            </Box>
                        </Card>
                    </Layout.Section>

                    {/* Step 2 Card */}
                    <Layout.Section variant="oneHalf">
                        <Card padding="0">
                            {/* Top Banner section */}
                            <div style={{ backgroundColor: "#FCE72A", padding: "16px", borderTopLeftRadius: "8px", borderTopRightRadius: "8px", height: "140px", position: "relative" }}>
                                <div style={{ position: "absolute", top: "40px", right: "20px" }}>
                                    <Button variant="primary" tone="critical">Create Label</Button>
                                </div>
                            </div>

                            {/* Bottom Content section */}
                            <Box padding="400">
                                <BlockStack gap="400">
                                    <BlockStack gap="200">
                                        <Text as="h3" variant="headingMd" fontWeight="bold">
                                            Step 2: Create your label.
                                        </Text>
                                        <Text as="p" variant="bodyMd" tone="subdued">
                                            To begin the procedure, click the "Labels" tab, then "Create Labels," then personalize the label to meet your needs.
                                        </Text>
                                    </BlockStack>
                                    <InlineStack>
                                        <fetcher.Form method="post">
                                            <input type="hidden" name="actionType" value="create_label" />
                                            <Button variant="primary" tone="critical" submit>
                                                Create Label
                                            </Button>
                                        </fetcher.Form>
                                    </InlineStack>
                                </BlockStack>
                            </Box>
                        </Card>
                    </Layout.Section>
                </Layout>
            </BlockStack>
        </Page>
    );
}
