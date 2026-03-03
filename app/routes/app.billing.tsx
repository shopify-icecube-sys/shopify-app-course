import {
    Page,
    Layout,
    Card,
    Text,
    BlockStack,
    Box,
    InlineGrid,
    Button,
    Badge,
    InlineStack,
    Modal,
    List,
    Banner,
} from "@shopify/polaris";
import { useState, useCallback } from "react";
import type { LoaderFunctionArgs, HeadersFunction } from "react-router";
import { authenticate } from "../shopify.server";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { NavigationTabs } from "../components/NavigationTabs";
import { useRouteError, useNavigate, useSearchParams } from "react-router";
import { useEffect } from "react";

export const loader = async ({ request }: LoaderFunctionArgs) => {
    await authenticate.admin(request);
    return null;
};

export default function BillingPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const activePlan = searchParams.get("plan");

    const [isFreeModalActive, setIsFreeModalActive] = useState(false);
    const [isGrowthModalActive, setIsGrowthModalActive] = useState(false);
    const [isCancelModalActive, setIsCancelModalActive] = useState(false);
    const [showSuccessBanner, setShowSuccessBanner] = useState(false);
    const [showWarningBanner, setShowWarningBanner] = useState(false);
    const [persistedPlan, setPersistedPlan] = useState<string | null>(null);

    // Persist plan and handle banner visibility
    useEffect(() => {
        const savedPlan = localStorage.getItem("shopify_active_plan");
        const wasCancelled = searchParams.get("cancelled") === "true";

        // If we have a new plan in the URL, it's a fresh activation
        if (activePlan) {
            localStorage.setItem("shopify_active_plan", activePlan);
            setPersistedPlan(activePlan);
            setShowSuccessBanner(true);
            setShowWarningBanner(false);
        } else if (wasCancelled) {
            setShowWarningBanner(true);
            setShowSuccessBanner(false);
            setPersistedPlan(null);
        } else if (savedPlan) {
            // Otherwise, just load the existing plan silently
            setPersistedPlan(savedPlan);
        }
    }, [activePlan, searchParams]);

    // Derived active plan (URL takes priority, then persisted)
    const effectivePlan = activePlan || persistedPlan;

    const toggleFreeModal = useCallback(() => setIsFreeModalActive(!isFreeModalActive), [isFreeModalActive]);
    const toggleGrowthModal = useCallback(() => setIsGrowthModalActive(!isGrowthModalActive), [isGrowthModalActive]);
    const toggleCancelModal = useCallback(() => setIsCancelModalActive(!isCancelModalActive), [isCancelModalActive]);

    const handleDismissBanner = useCallback(() => {
        setShowSuccessBanner(false);
        // Remove the ?plan=... from URL to prevent banner from reappearing on refresh
        navigate("/app/billing", { replace: true });
    }, [navigate]);

    const handleDismissWarning = useCallback(() => {
        setShowWarningBanner(false);
        navigate("/app/billing", { replace: true });
    }, [navigate]);

    // Auto-dismiss the success banner after 1 minute
    useEffect(() => {
        if (showSuccessBanner) {
            const timer = setTimeout(() => {
                handleDismissBanner();
            }, 60000);
            return () => clearTimeout(timer);
        }
    }, [showSuccessBanner, handleDismissBanner]);

    // Auto-dismiss the warning banner after 1 minute
    useEffect(() => {
        if (showWarningBanner) {
            const timer = setTimeout(() => {
                handleDismissWarning();
            }, 60000);
            return () => clearTimeout(timer);
        }
    }, [showWarningBanner, handleDismissWarning]);

    const handleFreeActivation = useCallback(() => {
        setIsFreeModalActive(false);
        navigate("/app/billing?plan=free");
    }, [navigate]);

    const handleGrowthActivation = useCallback(() => {
        setIsGrowthModalActive(false);
        navigate("/app/approve-billing");
    }, [navigate]);

    const handleCancelPlan = useCallback(() => {
        setIsCancelModalActive(false);
        localStorage.removeItem("shopify_active_plan");
        setPersistedPlan(null);
        navigate("/app/billing?cancelled=true", { replace: true });
    }, [navigate]);

    return (
        <Page title="Billing">
            <NavigationTabs />
            <Box paddingBlockStart="400">
                <Layout>
                    <Layout.Section>
                        {activePlan && showSuccessBanner && (
                            <Box paddingBlockEnd="400">
                                <Banner
                                    tone="success"
                                    title={`${activePlan === "growth" ? "Growth" : "Free"} plan active`}
                                    onDismiss={handleDismissBanner}
                                    action={{
                                        content: "Cancel plan",
                                        onAction: toggleCancelModal,
                                    }}
                                >
                                    <Text as="p">
                                        Your {activePlan === "growth" ? "$29/month subscription" : "free plan"} is active. You can manage or cancel it from Shopify billing settings.
                                    </Text>
                                </Banner>
                            </Box>
                        )}

                        {showWarningBanner && (
                            <Box paddingBlockEnd="400">
                                <Banner
                                    tone="warning"
                                    title="Subscription cancelled"
                                    onDismiss={handleDismissWarning}
                                >
                                    <Text as="p">
                                        The growth plan has been cancelled. Merchants can subscribe again at any time.
                                    </Text>
                                </Banner>
                            </Box>
                        )}

                        <Card>
                            <BlockStack gap="400">
                                <InlineStack align="space-between">
                                    <BlockStack gap="100">
                                        <InlineStack gap="200" blockAlign="center">
                                            <Text as="h2" variant="headingMd">
                                                Billing plans
                                            </Text>
                                            <Badge tone="info">Beta</Badge>
                                        </InlineStack>
                                        <Text as="p" variant="bodyMd" tone="subdued">
                                            Pick the plan that works for your workflow. Plans below preview what merchants see before approving charges.
                                        </Text>
                                    </BlockStack>
                                </InlineStack>

                                <InlineGrid columns={{ xs: 1, md: 2 }} gap="400">
                                    {/* Free Plan */}
                                    <Box
                                        padding="500"
                                        borderWidth="025"
                                        borderColor={effectivePlan === "free" ? "border-success" : "border-secondary"}
                                        borderRadius="300"
                                        background={effectivePlan === "free" ? "bg-surface-success" : "bg-surface-secondary"}
                                    >
                                        <BlockStack gap="400">
                                            <Box>
                                                <InlineStack align="space-between" blockAlign="center">
                                                    <BlockStack gap="100">
                                                        <Text as="h3" variant="headingSm" fontWeight="bold">
                                                            Free plan
                                                        </Text>
                                                        <Text as="p" variant="bodyMd" tone="subdued">
                                                            Essential analytics, 500 orders/mo, email support.
                                                        </Text>
                                                    </BlockStack>
                                                    {effectivePlan === "free" && <Badge tone="success">Active</Badge>}
                                                </InlineStack>
                                            </Box>

                                            <InlineStack gap="100" blockAlign="baseline">
                                                <Text as="p" variant="headingLg" fontWeight="bold">
                                                    $0
                                                </Text>
                                                <Text as="p" variant="bodyMd" tone="subdued">
                                                    / forever
                                                </Text>
                                            </InlineStack>

                                            {effectivePlan === "free" ? (
                                                <Button fullWidth onClick={toggleCancelModal} tone="critical">
                                                    Cancel free plan
                                                </Button>
                                            ) : (
                                                <Button
                                                    fullWidth
                                                    onClick={toggleFreeModal}
                                                    disabled={effectivePlan === "growth"}
                                                >
                                                    Activate free plan
                                                </Button>
                                            )}
                                        </BlockStack>
                                    </Box>

                                    {/* Growth Plan */}
                                    <Box
                                        padding="500"
                                        borderWidth="025"
                                        borderColor={effectivePlan === "growth" ? "border-success" : "border-secondary"}
                                        borderRadius="300"
                                        background={effectivePlan === "growth" ? "bg-surface-success" : "bg-surface-secondary"}
                                    >
                                        <BlockStack gap="400">
                                            <Box>
                                                <InlineStack align="space-between" blockAlign="center">
                                                    <BlockStack gap="100">
                                                        <Text as="h3" variant="headingSm" fontWeight="bold">
                                                            Growth plan
                                                        </Text>
                                                        <Text as="p" variant="bodyMd" tone="subdued">
                                                            Advanced reports, unlimited orders, priority chat.
                                                        </Text>
                                                    </BlockStack>
                                                    {effectivePlan === "growth" && <Badge tone="success">Active</Badge>}
                                                </InlineStack>
                                            </Box>

                                            <InlineStack gap="100" blockAlign="baseline">
                                                <Text as="p" variant="headingLg" fontWeight="bold">
                                                    $29
                                                </Text>
                                                <Text as="p" variant="bodyMd" tone="subdued">
                                                    / month
                                                </Text>
                                            </InlineStack>

                                            {effectivePlan === "growth" ? (
                                                <Button fullWidth onClick={toggleCancelModal} tone="critical">
                                                    Cancel subscription
                                                </Button>
                                            ) : (
                                                <Button
                                                    variant="primary"
                                                    fullWidth
                                                    onClick={toggleGrowthModal}
                                                    disabled={effectivePlan === "free"}
                                                >
                                                    Start $29/month subscription
                                                </Button>
                                            )}
                                        </BlockStack>
                                    </Box>
                                </InlineGrid>
                            </BlockStack>
                        </Card>
                    </Layout.Section>
                </Layout>
            </Box>

            {/* Free Plan Modal */}
            <Modal
                open={isFreeModalActive}
                onClose={toggleFreeModal}
                title="Free plan"
                primaryAction={{
                    content: "Activate free plan",
                    onAction: handleFreeActivation,
                }}
                secondaryActions={[
                    {
                        content: "Cancel",
                        onAction: toggleFreeModal,
                    },
                ]}
            >
                <Modal.Section>
                    <BlockStack gap="400">
                        <Text as="p">
                            Perfect for new merchants evaluating the app. Includes essential dashboards, 7-day retention summaries, and community support.
                        </Text>
                        <List>
                            <List.Item>500 tracked orders per month</List.Item>
                            <List.Item>Basic automation recipes</List.Item>
                            <List.Item>Email support in 24 hours</List.Item>
                        </List>
                    </BlockStack>
                </Modal.Section>
            </Modal>

            {/* Growth Plan Modal */}
            <Modal
                open={isGrowthModalActive}
                onClose={toggleGrowthModal}
                title="Growth plan"
                primaryAction={{
                    content: "Start $29/month subscription",
                    onAction: handleGrowthActivation,
                }}
                secondaryActions={[
                    {
                        content: "Maybe later",
                        onAction: toggleGrowthModal,
                    },
                ]}
            >
                <Modal.Section>
                    <BlockStack gap="400">
                        <Text as="p">
                            Unlock unlimited usage with priority support. Designed for teams scaling automation and insights.
                        </Text>
                        <List>
                            <List.Item>Unlimited tracked orders & reports</List.Item>
                            <List.Item>Custom KPIs and export tooling</List.Item>
                            <List.Item>Priority chat + onboarding specialist</List.Item>
                        </List>
                    </BlockStack>
                </Modal.Section>
            </Modal>

            {/* Cancel Plan Modal */}
            <Modal
                open={isCancelModalActive}
                onClose={toggleCancelModal}
                title={`Cancel ${effectivePlan === "growth" ? "Growth" : "Free"} plan?`}
                primaryAction={{
                    content: "Yes, cancel plan",
                    onAction: handleCancelPlan,
                    destructive: true,
                }}
                secondaryActions={[
                    {
                        content: "No, keep plan",
                        onAction: toggleCancelModal,
                    },
                ]}
            >
                <Modal.Section>
                    <Text as="p">
                        Are you sure you want to cancel your {effectivePlan === "growth" ? "Growth" : "Free"} plan? You will lose access to all {effectivePlan === "growth" ? "Growth" : "Free"} features immediately.
                    </Text>
                </Modal.Section>
            </Modal>
        </Page>
    );
}

export function ErrorBoundary() {
    return boundary.error(useRouteError());
}

export const headers: HeadersFunction = (headersArgs) => {
    return boundary.headers(headersArgs);
};
