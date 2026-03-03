import { Card, BlockStack, Text, Form, FormLayout, TextField, Button } from "@shopify/polaris";

interface ProductFormProps {
    productName: string;
    price: string;
    description: string;
    onProductNameChange: (value: string) => void;
    onPriceChange: (value: string) => void;
    onDescriptionChange: (value: string) => void;
    onSubmit: (event?: React.FormEvent) => void;
}

export function ProductForm({
    productName,
    price,
    description,
    onProductNameChange,
    onPriceChange,
    onDescriptionChange,
    onSubmit,
}: ProductFormProps) {
    return (
        <Card>
            <BlockStack gap="400">
                <Text as="h2" variant="headingMd">
                    Add Product
                </Text>
                <Form onSubmit={onSubmit}>
                    <FormLayout>
                        <TextField
                            label="Product Name"
                            value={productName}
                            onChange={onProductNameChange}
                            placeholder="e.g. Blue Snowboard"
                            autoComplete="off"
                        />
                        <TextField
                            label="Price"
                            value={price}
                            onChange={onPriceChange}
                            type="number"
                            prefix="$"
                            placeholder="0.00"
                            autoComplete="off"
                        />
                        <TextField
                            label="Description"
                            value={description}
                            onChange={onDescriptionChange}
                            multiline={4}
                            placeholder="Describe your product..."
                            autoComplete="off"
                        />
                        <Button submit variant="primary">
                            Add Product
                        </Button>
                    </FormLayout>
                </Form>
            </BlockStack>
        </Card>
    );
}
