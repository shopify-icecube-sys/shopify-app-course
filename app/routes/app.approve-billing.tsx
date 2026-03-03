import {
    Page,
    Layout,
    Card,
    Text,
    BlockStack,
    Box,
    InlineStack,
    Button,
    Banner,
    Thumbnail,
    Divider,
    RadioButton,
    FooterHelp,
    Link,
    TextField,
    InlineGrid,
} from "@shopify/polaris";
import { useState, useCallback, useEffect } from "react";
import type { LoaderFunctionArgs, HeadersFunction } from "react-router";
import { authenticate } from "../shopify.server";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { useRouteError, useNavigate } from "react-router";
import { AppsIcon, AlertTriangleIcon } from "@shopify/polaris-icons";

export const loader = async ({ request }: LoaderFunctionArgs) => {
    await authenticate.admin(request);
    return null;
};

export default function ApproveSubscription() {
    const navigate = useNavigate();
    const [paymentMethod, setPaymentMethod] = useState("card");
    const [isLoading, setIsLoading] = useState(false);
    const [showCardForm, setShowCardForm] = useState(false);
    const [isRedirecting, setIsRedirecting] = useState(false);
    const [hasPaymentMethods, setHasPaymentMethods] = useState(false); // Default to false like the screenshot

    // Mock form state
    const [cardNumber, setCardNumber] = useState("");
    const [expiry, setExpiry] = useState("");
    const [cvv, setCvv] = useState("");

    const handlePaymentChange = useCallback(
        (_checked: boolean, newValue: string) => {
            setPaymentMethod(newValue);
            if (newValue !== "card") setShowCardForm(false);
        },
        [],
    );

    const handleApprove = useCallback(() => {
        setIsLoading(true);

        if (paymentMethod === "paypal") {
            // Step 1: Trigger the "Redirect" state
            setIsRedirecting(true);

            // Step 2: Simulate the process and then navigate
            setTimeout(() => {
                setIsRedirecting(false);
                navigate("/app/billing?plan=growth");
            }, 3000);
        } else {
            setTimeout(() => {
                navigate("/app/billing?plan=growth");
            }, 1500);
        }
    }, [navigate, paymentMethod]);

    // If redirecting, show a convincing full-page "Handshake" state
    if (isRedirecting) {
        return (
            <Page>
                <Box padding="800">
                    <div style={{
                        height: '60vh',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        textAlign: 'center',
                        gap: '32px'
                    }}>
                        {/* Real PayPal Branded Mockup */}
                        <div style={{
                            background: '#f7f7f7',
                            padding: '40px',
                            borderRadius: '20px',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            width: '100%',
                            maxWidth: '400px'
                        }}>
                            <img
                                src="https://www.paypalobjects.com/webstatic/mktg/logo/pp_cc_mark_111x66.jpg"
                                alt="PayPal Logo"
                                style={{ width: '120px', marginBottom: '24px' }}
                            />
                            <BlockStack gap="400">
                                <Text as="h1" variant="headingLg" fontWeight="bold">
                                    Connecting to PayPal...
                                </Text>
                                <Text as="p" variant="bodyMd" tone="subdued">
                                    Please securely authorize this payment in the window that follows.
                                </Text>
                                <Box paddingBlockStart="400">
                                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                                        <Button loading variant="plain">Redirecting</Button>
                                    </div>
                                </Box>
                            </BlockStack>
                        </div>

                        <Text as="p" variant="bodySm" tone="subdued">
                            Do not close this window. You will be redirected back automatically.
                        </Text>
                    </div>
                </Box>
            </Page>
        );
    }

    return (
        <Page
            backAction={{ content: "Billing", onAction: () => navigate("/app/billing") }}
            title="Approve subscription"
            primaryAction={<Button onClick={() => navigate("/app/billing")}>Cancel</Button>}
        >
            <Layout>
                <Layout.Section>
                    <BlockStack gap="400">
                        <Banner tone="warning">
                            <Text as="p">You will not be billed for this test charge.</Text>
                        </Banner>

                        {/* App Info Card */}
                        <Card>
                            <InlineStack gap="400" blockAlign="center">
                                <Box padding="100" background="bg-surface-secondary" borderRadius="200">
                                    <Thumbnail source={AppsIcon} alt="App Icon" size="medium" />
                                </Box>
                                <BlockStack gap="100">
                                    <Text as="h2" variant="headingMd">
                                        my-new-app
                                    </Text>
                                    <Text as="p" variant="bodyMd" tone="subdued">
                                        by icecubetest
                                    </Text>
                                </BlockStack>
                            </InlineStack>
                        </Card>

                        {/* Plan Details Card */}
                        <Card>
                            <BlockStack gap="400">
                                <BlockStack gap="100">
                                    <Text as="p" variant="bodySm" tone="subdued">Plan</Text>
                                    <Text as="p" variant="bodyMd" fontWeight="bold">Growth plan</Text>
                                </BlockStack>
                                <Divider />
                                <BlockStack gap="100">
                                    <Text as="p" variant="bodySm" tone="subdued">Subscription details</Text>
                                    <Text as="p" variant="bodyMd">$29.00 USD every 30 days</Text>
                                </BlockStack>
                            </BlockStack>
                        </Card>

                        {/* Payment Method Handling */}
                        {!hasPaymentMethods ? (
                            <Card>
                                <InlineStack gap="300" blockAlign="center">
                                    <Box padding="100">
                                        <Text as="span" tone="caution">
                                            <AlertTriangleIcon style={{ width: '20px' }} />
                                        </Text>
                                    </Box>
                                    <Text as="p" variant="bodyMd">
                                        You don't have any payment methods on file.{" "}
                                        <Link
                                            url="shopify://admin/settings/billing/profile"
                                            external
                                            removeUnderline
                                        >
                                            Go to billing settings
                                        </Link>{" "}
                                        to add one.
                                    </Text>
                                </InlineStack>
                            </Card>
                        ) : (
                            <Card>
                                <BlockStack gap="400">
                                    <Text as="h2" variant="headingMd">Payment method</Text>
                                    <Text as="p" variant="bodyMd" tone="subdued">
                                        Choose how you'd like to pay for this charge.
                                    </Text>

                                    {/* Credit Card Option */}
                                    <div
                                        onClick={() => handlePaymentChange(true, "card")}
                                        style={{ cursor: "pointer" }}
                                    >
                                        <Box
                                            padding="400"
                                            borderWidth="025"
                                            borderColor={paymentMethod === "card" ? "border-brand" : "border-secondary"}
                                            borderRadius="200"
                                            background={paymentMethod === "card" ? "bg-surface-info" : undefined}
                                        >
                                            <BlockStack gap="400">
                                                <RadioButton
                                                    label="Credit or debit card"
                                                    checked={paymentMethod === "card"}
                                                    id="card"
                                                    name="payment"
                                                    onChange={handlePaymentChange}
                                                />

                                                {paymentMethod === "card" && (
                                                    <Box paddingInlineStart="600">
                                                        {!showCardForm ? (
                                                            <Link onClick={() => setShowCardForm(true)} removeUnderline>
                                                                + Add credit card
                                                            </Link>
                                                        ) : (
                                                            <div onClick={(e) => e.stopPropagation()}>
                                                                <BlockStack gap="300">
                                                                    <TextField
                                                                        label="Card number"
                                                                        value={cardNumber}
                                                                        onChange={setCardNumber}
                                                                        placeholder="0000 0000 0000 0000"
                                                                        autoComplete="cc-number"
                                                                    />
                                                                    <InlineGrid columns={2} gap="300">
                                                                        <TextField
                                                                            label="Expiry (MM/YY)"
                                                                            value={expiry}
                                                                            onChange={setExpiry}
                                                                            placeholder="MM/YY"
                                                                            autoComplete="cc-exp"
                                                                        />
                                                                        <TextField
                                                                            label="CVV"
                                                                            value={cvv}
                                                                            onChange={setCvv}
                                                                            placeholder="123"
                                                                            autoComplete="cc-csc"
                                                                        />
                                                                    </InlineGrid>
                                                                    <InlineStack gap="200">
                                                                        <Button size="slim" onClick={() => { setShowCardForm(false); setHasPaymentMethods(true); }}>Save card</Button>
                                                                        <Button size="slim" variant="tertiary" onClick={() => setShowCardForm(false)}>Cancel</Button>
                                                                    </InlineStack>
                                                                </BlockStack>
                                                            </div>
                                                        )}
                                                    </Box>
                                                )}
                                            </BlockStack>
                                        </Box>
                                    </div>

                                    {/* PayPal Option */}
                                    <div
                                        onClick={() => handlePaymentChange(true, "paypal")}
                                        style={{ cursor: "pointer" }}
                                    >
                                        <Box
                                            padding="400"
                                            borderWidth="025"
                                            borderColor={paymentMethod === "paypal" ? "border-brand" : "border-secondary"}
                                            borderRadius="200"
                                            background={paymentMethod === "paypal" ? "bg-surface-info" : undefined}
                                        >
                                            <RadioButton
                                                label="PayPal"
                                                checked={paymentMethod === "paypal"}
                                                id="paypal"
                                                name="payment"
                                                onChange={handlePaymentChange}
                                            />
                                            {paymentMethod === "paypal" && (
                                                <Box paddingInlineStart="600" paddingBlockStart="200">
                                                    <Text as="p" variant="bodyMd" tone="subdued">
                                                        You will be redirected to PayPal to complete your purchase securely.
                                                    </Text>
                                                </Box>
                                            )}
                                        </Box>
                                    </div>
                                </BlockStack>
                            </Card>
                        )}
                    </BlockStack>
                </Layout.Section>

                {/* Sidebar Summary */}
                <Layout.Section variant="oneThird">
                    <BlockStack gap="400">
                        <Card>
                            <BlockStack gap="400">
                                <Text as="h2" variant="headingMd">Your next bill</Text>

                                <InlineStack align="space-between">
                                    <BlockStack gap="100">
                                        <Text as="p" variant="bodyMd">Subtotal</Text>
                                        <Text as="p" variant="bodySm" tone="subdued">plus any applicable taxes</Text>
                                    </BlockStack>
                                    <Text as="p" variant="bodyMd" fontWeight="bold">$29.00</Text>
                                </InlineStack>

                                <Divider />

                                <InlineStack align="space-between">
                                    <BlockStack gap="100">
                                        <Text as="p" variant="bodyMd" fontWeight="bold">Total</Text>
                                        <Text as="p" variant="bodySm" tone="subdued">Due Nov 24</Text>
                                    </BlockStack>
                                    <Text as="p" variant="bodyMd" fontWeight="bold">$29.00</Text>
                                </InlineStack>

                                <Box paddingBlockStart="200">
                                    <Button
                                        variant="primary"
                                        fullWidth
                                        onClick={handleApprove}
                                        loading={isLoading}
                                        disabled={!hasPaymentMethods}
                                    >
                                        Approve
                                    </Button>
                                </Box>
                            </BlockStack>
                        </Card>
                    </BlockStack>
                </Layout.Section>
            </Layout>

            <FooterHelp>
                By proceeding, you are agreeing to the{" "}
                <Link url="https://help.shopify.com/manual/your-account/manage-billing/your-invoice/apps" external>
                    Terms of Service
                </Link>
                . Subject to government tax and other prevailing charges.
            </FooterHelp>
        </Page>
    );
}

export function ErrorBoundary() {
    return boundary.error(useRouteError());
}

export const headers: HeadersFunction = (headersArgs) => {
    return boundary.headers(headersArgs);
};
