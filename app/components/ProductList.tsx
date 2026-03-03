import { Card, BlockStack, Text, Box, InlineStack, Button } from "@shopify/polaris";

export interface Product {
    id: string;
    name: string;
    price: string;
    description: string;
}

interface ProductListProps {
    products: Product[];
    onRemove: (id: string) => void;
}

export function ProductList({ products, onRemove }: ProductListProps) {
    return (
        <Card>
            <BlockStack gap="400">
                <Text as="h2" variant="headingMd">
                    Product List
                </Text>
                {products.length === 0 ? (
                    <Box padding="400">
                        <BlockStack align="center" gap="200">
                            <Text as="p" variant="bodyMd" tone="subdued" alignment="center">
                                No product yet
                            </Text>
                        </BlockStack>
                    </Box>
                ) : (
                    <BlockStack gap="400">
                        {products.map((product) => (
                            <ProductItem key={product.id} product={product} onRemove={onRemove} />
                        ))}
                    </BlockStack>
                )}
            </BlockStack>
        </Card>
    );
}

function ProductItem({ product, onRemove }: { product: Product; onRemove: (id: string) => void }) {
    return (
        <Box padding="400" borderStyle="solid" borderColor="border" borderWidth="025" borderRadius="200">
            <InlineStack align="space-between" blockAlign="center" gap="400">
                <Box width="100%">
                    <BlockStack gap="100">
                        <Text as="h3" variant="headingSm">
                            {product.name}
                        </Text>
                        <Text as="p" variant="bodyMd">
                            ${product.price}
                        </Text>
                        <Text as="p" variant="bodySm" tone="subdued">
                            {product.description}
                        </Text>
                    </BlockStack>
                </Box>
                <Button tone="critical" onClick={() => onRemove(product.id)}>
                    Remove
                </Button>
            </InlineStack>
        </Box>
    );
}
