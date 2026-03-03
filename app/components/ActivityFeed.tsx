import { BlockStack, Text, List } from "@shopify/polaris";

export function ActivityFeed() {
    return (
        <BlockStack gap="300">
            <Text as="h2" variant="headingSm" fontWeight="medium">
                Activity Feed
            </Text>
            <List>
                <List.Item>Order #1001 was placed 2 hours ago</List.Item>
                <List.Item>Product "Sample Product" was updated 5 hours ago</List.Item>
                <List.Item>New customer registered 1 day ago</List.Item>
                <List.Item>Order #1000 was completed 2 days ago</List.Item>
                <List.Item>Inventory updated for "Sample Product" 3 days ago</List.Item>
            </List>
        </BlockStack>
    );
}
