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
            // Robustly preserve all Shopify search parameters (shop, host, id_token, etc.)
            const searchParams = new URLSearchParams(location.search);
            navigate(`${targetPath}?${searchParams.toString()}`);
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
