import {
    Page,
    Layout,
    Card,
    BlockStack,
    Text,
    Button,
    InlineStack,
    Box,
    Checkbox,
    ButtonGroup,
} from "@shopify/polaris";
import { useCallback, useState } from "react";
import { useNavigate } from "react-router";

export default function CreateLabel() {
    const navigate = useNavigate();
    const [position, setPosition] = useState(1);
    const [hoverEffect, setHoverEffect] = useState("yes");
    const [conditions, setConditions] = useState({
        productPages: true,
        collectionPages: false,
        searchResultsPages: false,
    });

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
                        backgroundColor: isSelected ? "white" : "white",
                        borderRadius: "8px",
                        border: isSelected ? "2px solid black" : "1px solid transparent",
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
                            <div style={{ position: "relative", width: "100%", paddingTop: "100%", backgroundColor: "#e1e3e5", borderRadius: "8px", overflow: "hidden" }}>
                                <img
                                    src="https://cdn.shopify.com/s/files/1/0533/2089/files/placeholder-images-lifestyle-1_800x800.jpg"
                                    alt="Product preview"
                                    style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", objectFit: "cover" }}
                                />
                                {/* The Label */}
                                <div style={{
                                    position: "absolute",
                                    top: position <= 3 ? "12px" : position <= 6 ? "50%" : "auto",
                                    bottom: position > 6 ? "12px" : "auto",
                                    left: position % 3 === 1 ? "12px" : position % 3 === 2 ? "50%" : "auto",
                                    right: position % 3 === 0 ? "12px" : "auto",
                                    transform: (position % 3 === 2 ? "translateX(-50%) " : "") + (position >= 4 && position <= 6 ? "translateY(-50%)" : ""),
                                    backgroundColor: "black",
                                    color: "white",
                                    padding: "4px 8px",
                                    fontSize: "12px",
                                    fontWeight: "bold",
                                    borderRadius: "4px",
                                    zIndex: 10
                                }}>
                                    NEW
                                </div>
                            </div>
                            <Button variant="primary" fullWidth>Change Product</Button>
                        </BlockStack>
                    </Card>
                </Layout.Section>

                {/* Right Section - Settings */}
                <Layout.Section>
                    <Card padding="400">
                        <BlockStack gap="600">
                            <Button fullWidth variant="primary">Change Label</Button>

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
                                    <Text as="p" variant="bodyMd" tone="subdued">Hover effect</Text>
                                    <ButtonGroup variant="segmented">
                                        <Button pressed={hoverEffect === "yes"} onClick={() => setHoverEffect("yes")}>Yes</Button>
                                        <Button pressed={hoverEffect === "no"} onClick={() => setHoverEffect("no")}>No</Button>
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
        </Page>
    );
}
