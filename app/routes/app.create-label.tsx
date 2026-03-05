import {
    Page,
    Layout,
    Card,
    BlockStack,
    Text,
    Button,
    InlineStack,
    Checkbox,
    ButtonGroup,
    Modal,
    TextField,
    Thumbnail,
    Select,
    OptionList,
    Popover,
    ActionList,
    Icon,
} from "@shopify/polaris";
import { useCallback, useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { SearchIcon } from '@shopify/polaris-icons';

// If you're using App Bridge, you can import this
// import { ResourcePicker } from '@shopify/app-bridge-react';

export default function CreateLabel() {
    const navigate = useNavigate();

    // State declarations
    const [position, setPosition] = useState(1);
    const [hoverEffect, setHoverEffect] = useState("yes");
    const [conditions, setConditions] = useState({
        productPages: true,
        collectionPages: false,
        searchResultsPages: false,
    });
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [labelType, setLabelType] = useState("text");
    const [labelText, setLabelText] = useState("NEW");
    const [tempLabelText, setTempLabelText] = useState("NEW");

    // Product selection state
    const [isProductPopoverOpen, setIsProductPopoverOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<{
        id: string;
        title: string;
        image?: { url: string };
    } | null>(null);
    const [productImage, setProductImage] = useState<string>(
        "https://cdn.shopify.com/s/files/1/0533/2089/files/placeholder-images-lifestyle-1_800x800.jpg"
    );

    // Mock products for demonstration - in real app, fetch from Shopify API
    const [products, setProducts] = useState([
        {
            id: "1",
            title: "Sample Product 1",
            image: { url: "https://cdn.shopify.com/s/files/1/0533/2089/files/placeholder-images-product-1.png" }
        },
        {
            id: "2",
            title: "Sample Product 2",
            image: { url: "https://cdn.shopify.com/s/files/1/0533/2089/files/placeholder-images-product-2.png" }
        },
        {
            id: "3",
            title: "Sample Product 3",
            image: { url: "https://cdn.shopify.com/s/files/1/0533/2089/files/placeholder-images-product-3.png" }
        },
    ]);

    // Fetch real products from your API
    useEffect(() => {
        // You can fetch products from your backend here
        const fetchProducts = async () => {
            try {
                // const response = await fetch('/api/products');
                // const data = await response.json();
                // setProducts(data);
            } catch (error) {
                console.error('Error fetching products:', error);
            }
        };

        // fetchProducts();
    }, []);

    // Handle product selection
    const handleProductSelect = useCallback((product: any) => {
        setSelectedProduct({
            id: product.id,
            title: product.title,
            image: product.image
        });

        if (product.image?.url) {
            setProductImage(product.image.url);
        }

        setIsProductPopoverOpen(false);
    }, []);

    // Manage multiple files
    const [tempFiles, setTempFiles] = useState<File[]>([]);

    // Handle file uploads
    const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (files) {
            const acceptedFiles = Array.from(files);
            setTempFiles((prev) => [...prev, ...acceptedFiles]);
        }
    }, []);

    const validImageTypes = ['image/gif', 'image/jpeg', 'image/png', 'image/svg+xml'];

    // List of uploaded files for display
    const uploadedFilesList = (
        <BlockStack gap="200">
            {tempFiles.map((file, index) => (
                <div
                    key={index}
                    style={{ display: "flex", alignItems: "center", gap: "8px" }}
                >
                    <Thumbnail
                        size="small"
                        alt={file.name}
                        source={
                            validImageTypes.includes(file.type)
                                ? window.URL.createObjectURL(file)
                                : ""
                        }
                    />
                    <Text variant="bodySm" as="span">
                        {file.name}
                    </Text>
                </div>
            ))}
        </BlockStack>
    );

    const handleModalClose = () => {
        setIsModalOpen(false);
        setTempLabelText(labelText);
    };

    const handleModalSave = () => {
        setLabelText(tempLabelText);
        setIsModalOpen(false);
    };

    const handleConditionChange = useCallback((value: boolean, name: string) => {
        setConditions((prev) => ({ ...prev, [name]: value }));
    }, []);

    const handlePositionClick = (pos: number) => {
        setPosition(pos);
    };

    // Helper to render the 3x3 grid
    const renderGrid = () => {
        const gridItems = [];
        for (let i = 1; i <= 9; i++) {
            const isSelected = position === i;
            gridItems.push(
                <div
                    key={i}
                    onClick={() => handlePositionClick(i)}
                    style={{
                        width: "48px",
                        height: "48px",
                        backgroundColor: "white",
                        borderRadius: "8px",
                        border: isSelected ? "2px solid black" : "1px solid #e1e3e5",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                        boxShadow: isSelected ? "0 0 0 1px black" : "0 1px 3px rgba(0,0,0,0.1)",
                    }}
                >
                    <div
                        style={{
                            width: "12px",
                            height: "12px",
                            backgroundColor: "#5c5f62",
                            borderRadius: "2px",
                        }}
                    />
                </div>
            );
        }

        return (
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(3, 48px)",
                    gap: "16px",
                    justifyContent: "center",
                    padding: "24px",
                    backgroundColor: "#f4f6f8",
                    borderRadius: "8px",
                }}
            >
                {gridItems}
            </div>
        );
    };

    const productActivator = (
        <Button
            onClick={() => setIsProductPopoverOpen(true)}
            disclosure
            fullWidth
        >
            {selectedProduct ? selectedProduct.title : "Select a product"}
        </Button>
    );

    return (
        <Page
            title="Create Label"
            backAction={{
                content: "Home",
                onAction: () => navigate("/app/home"),
            }}
        >
            <Layout>
                {/* Left Section - Preview */}
                <Layout.Section variant="oneThird">
                    <Card padding="400">
                        <BlockStack gap="400">
                            <div
                                style={{
                                    position: "relative",
                                    width: "100%",
                                    paddingTop: "100%",
                                    backgroundColor: "#e1e3e5",
                                    borderRadius: "8px",
                                    overflow: "hidden",
                                }}
                            >
                                <img
                                    src={productImage}
                                    alt={selectedProduct?.title || "Product preview"}
                                    style={{
                                        position: "absolute",
                                        top: 0,
                                        left: 0,
                                        width: "100%",
                                        height: "100%",
                                        objectFit: "cover",
                                    }}
                                />

                                {/* Product title overlay */}
                                {selectedProduct && (
                                    <div
                                        style={{
                                            position: "absolute",
                                            bottom: "8px",
                                            left: "8px",
                                            backgroundColor: "rgba(0,0,0,0.6)",
                                            color: "white",
                                            padding: "4px 8px",
                                            borderRadius: "4px",
                                            fontSize: "12px",
                                            maxWidth: "calc(100% - 16px)",
                                            whiteSpace: "nowrap",
                                            overflow: "hidden",
                                            textOverflow: "ellipsis",
                                        }}
                                    >
                                        {selectedProduct.title}
                                    </div>
                                )}

                                {/* The Label */}
                                <div
                                    style={{
                                        position: "absolute",
                                        top: position <= 3 ? "12px" : position <= 6 ? "50%" : "auto",
                                        bottom: position > 6 ? "12px" : "auto",
                                        left:
                                            position % 3 === 1
                                                ? "12px"
                                                : position % 3 === 2
                                                    ? "50%"
                                                    : "auto",
                                        right: position % 3 === 0 ? "12px" : "auto",
                                        transform:
                                            (position % 3 === 2 ? "translateX(-50%) " : "") +
                                            (position >= 4 && position <= 6 ? "translateY(-50%)" : ""),
                                        backgroundColor: labelType === "text" ? "black" : "transparent",
                                        color: "white",
                                        padding: labelType === "text" ? "4px 8px" : "0",
                                        fontSize: "12px",
                                        fontWeight: "bold",
                                        borderRadius: "4px",
                                        zIndex: 10,
                                        maxWidth: "100px",
                                        maxHeight: "100px",
                                    }}
                                >
                                    {labelType === "image" && tempFiles.length > 0 && validImageTypes.includes(tempFiles[0].type) ? (
                                        <img
                                            src={window.URL.createObjectURL(tempFiles[0])}
                                            alt="Label Custom Image"
                                            style={{ width: "100%", height: "100%", objectFit: "contain" }}
                                        />
                                    ) : labelType === "text" ? (
                                        <span>{labelText}</span>
                                    ) : null}
                                </div>
                            </div>

                            {/* Product Selection */}
                            <BlockStack gap="200">
                                <Popover
                                    active={isProductPopoverOpen}
                                    activator={productActivator}
                                    onClose={() => setIsProductPopoverOpen(false)}
                                    autofocusTarget="first-node"
                                >
                                    <OptionList
                                        title="Products"
                                        options={products.map(product => ({
                                            value: product.id,
                                            label: product.title,
                                            media: product.image?.url ? (
                                                <Thumbnail
                                                    source={product.image.url}
                                                    alt={product.title}
                                                    size="small"
                                                />
                                            ) : undefined,
                                        }))}
                                        selected={selectedProduct ? [selectedProduct.id] : []}
                                        onChange={(selected) => {
                                            const product = products.find(p => p.id === selected[0]);
                                            if (product) {
                                                handleProductSelect(product);
                                            }
                                        }}
                                    />
                                </Popover>

                                <Button
                                    variant="primary"
                                    fullWidth
                                    onClick={() => window.open('/admin/products', '_blank')}
                                >
                                    Manage Products in Admin
                                </Button>
                            </BlockStack>
                        </BlockStack>
                    </Card>
                </Layout.Section>

                {/* Right Section - Settings */}
                <Layout.Section>
                    <Card padding="400">
                        <BlockStack gap="600">
                            <Button fullWidth variant="primary" onClick={() => setIsModalOpen(true)}>
                                Change Label
                            </Button>

                            <BlockStack gap="200">
                                <Text as="p" variant="bodyMd" fontWeight="medium">
                                    Label Position
                                </Text>
                                {renderGrid()}
                            </BlockStack>

                            <BlockStack gap="400">
                                <Text as="p" variant="bodySm" fontWeight="bold">
                                    CONDITIONS
                                </Text>

                                <InlineStack align="start" blockAlign="center" gap="400">
                                    <Text as="p" variant="bodyMd" tone="subdued">
                                        Hover effect
                                    </Text>
                                    <ButtonGroup variant="segmented">
                                        <Button
                                            pressed={hoverEffect === "yes"}
                                            onClick={() => setHoverEffect("yes")}
                                        >
                                            Yes
                                        </Button>
                                        <Button
                                            pressed={hoverEffect === "no"}
                                            onClick={() => setHoverEffect("no")}
                                        >
                                            No
                                        </Button>
                                    </ButtonGroup>
                                </InlineStack>

                                <BlockStack gap="200">
                                    <Checkbox
                                        label="Product Pages"
                                        checked={conditions.productPages}
                                        onChange={(newVal) => handleConditionChange(newVal, "productPages")}
                                    />
                                    <Checkbox
                                        label="Collection Pages"
                                        checked={conditions.collectionPages}
                                        onChange={(newVal) => handleConditionChange(newVal, "collectionPages")}
                                    />
                                    <Checkbox
                                        label="Search Results Pages"
                                        checked={conditions.searchResultsPages}
                                        onChange={(newVal) => handleConditionChange(newVal, "searchResultsPages")}
                                    />
                                </BlockStack>
                            </BlockStack>
                        </BlockStack>
                    </Card>
                </Layout.Section>
            </Layout>

            {/* Modal for Label customization and file upload */}
            <Modal
                open={isModalOpen}
                onClose={handleModalClose}
                title="Change Label"
                primaryAction={{
                    content: "Save",
                    onAction: handleModalSave,
                }}
                secondaryActions={[
                    {
                        content: "Cancel",
                        onAction: handleModalClose,
                    },
                ]}
            >
                <Modal.Section>
                    <BlockStack gap="400">
                        <ButtonGroup variant="segmented">
                            <Button
                                pressed={labelType === "text"}
                                onClick={() => setLabelType("text")}
                            >
                                Text Label
                            </Button>
                            <Button
                                pressed={labelType === "image"}
                                onClick={() => setLabelType("image")}
                            >
                                Upload Image/SVG
                            </Button>
                        </ButtonGroup>

                        {labelType === "text" && (
                            <TextField
                                label="Label Text"
                                value={tempLabelText}
                                onChange={setTempLabelText}
                                autoComplete="off"
                            />
                        )}

                        {labelType === "image" && (
                            <BlockStack gap="200">
                                <Text as="p" variant="bodyMd">Upload Images or SVG Files</Text>

                                {/* Upload Button */}
                                <Button onClick={() => document.getElementById('fileInput')?.click()}>
                                    Select Files
                                </Button>

                                {/* Hidden File Input */}
                                <input
                                    type="file"
                                    id="fileInput"
                                    style={{ display: 'none' }}
                                    multiple
                                    accept="image/*,.svg"
                                    onChange={handleFileUpload}
                                />

                                {/* Show list of uploaded files */}
                                {uploadedFilesList}
                            </BlockStack>
                        )}
                    </BlockStack>
                </Modal.Section>
            </Modal>
        </Page>
    );
}