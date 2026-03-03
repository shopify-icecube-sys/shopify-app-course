import { Tabs } from "@shopify/polaris";
import { useMemo, useCallback } from "react";
import { useLocation, useNavigate } from "react-router";

const TABS = [
    {
        id: "dashboard",
        content: "Dashboard",
        url: "/app",
    },
    {
        id: "products",
        content: "Products",
        url: "/app/qrgene",
    },
    {
        id: "analytics",
        content: "Analytics",
        url: "/app/analytics",
    },
    {
        id: "billing",
        content: "Billing",
        url: "/app/billing",
    },
];

export function NavigationTabs() {
    const location = useLocation();
    const navigate = useNavigate();

    const selected = useMemo(() => {
        const idx = TABS.findIndex((tab) => {
            if (tab.url === "/app") {
                return location.pathname === "/app" || location.pathname === "/app/";
            }
            return location.pathname.startsWith(tab.url);
        });
        return idx !== -1 ? idx : 0;
    }, [location.pathname]);

    const handleTabChange = useCallback(
        (selectedTabIndex: number) => {
            const targetPath = TABS[selectedTabIndex].url;
            // Use React Router's navigate for client-side SPA transition (no refresh).
            // We append location.search to preserve Shopify session parameters (shop, host, etc.)
            navigate(`${targetPath}${location.search}`);
        },
        [navigate, location.search]
    );

    return (
        <Tabs
            tabs={TABS}
            selected={selected}
            onSelect={handleTabChange}
        />
    );
}
