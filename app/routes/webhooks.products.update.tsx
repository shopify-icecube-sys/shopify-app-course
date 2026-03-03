import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { authenticate } from "../shopify.server";

export const action = async ({ request }: ActionFunctionArgs) => {
    const { shop, payload, topic } = await authenticate.webhook(request);

    console.log(`Received ${topic} webhook for ${shop}`);
    console.log("Product Payload:", JSON.stringify(payload, null, 2));

    // Here you can process the updated product data (payload)
    // For now, it just logs and returns 200 so Shopify logs the delivery as OK.

    return new Response();
};

export const loader = async () => {
    return new Response("Webhook active", { status: 200 });
};

export default function Webhook() {
    return null;
}
