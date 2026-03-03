import { Card, BlockStack, Text } from "@shopify/polaris";

interface StatCardProps {
    label: string;
    value: string;
    subtext: string;
}

export function StatCard({ label, value, subtext }: StatCardProps) {
    return (
        <Card>
            <BlockStack gap="200">
                <Text as="h2" variant="headingSm" fontWeight="medium">
                    {label}
                </Text>
                <BlockStack gap="050">
                    <Text as="p" variant="headingLg" fontWeight="bold">
                        {value}
                    </Text>
                    <Text as="p" variant="bodySm" tone="subdued">
                        {subtext}
                    </Text>
                </BlockStack>
            </BlockStack>
        </Card>
    );
}
