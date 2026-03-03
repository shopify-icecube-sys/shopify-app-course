import { useState } from "react";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { Form, useActionData, useLoaderData } from "react-router";

import { login } from "../../shopify.server";
import { loginErrorMessage } from "./error.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const errors = loginErrorMessage(await login(request));

  return { errors };
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const errors = loginErrorMessage(await login(request));

  return {
    errors,
  };
};

import { Page, Layout, Card, Text, TextField, Button, BlockStack, Box } from "@shopify/polaris";

export default function Auth() {
  const loaderData = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const [shop, setShop] = useState("");
  const { errors } = actionData || loaderData;

  return (
    <Page>
      <Layout>
        <Layout.Section>
          <Box paddingBlockStart="1000">
            <Card>
              <BlockStack gap="400">
                <Text as="h2" variant="headingMd">
                  Log in
                </Text>
                <Form method="post">
                  <BlockStack gap="400">
                    <TextField
                      name="shop"
                      label="Shop domain"
                      helpText="example.myshopify.com"
                      value={shop}
                      onChange={(value) => setShop(value)}
                      autoComplete="on"
                      error={errors.shop}
                    />
                    <Button submit variant="primary">
                      Log in
                    </Button>
                  </BlockStack>
                </Form>
              </BlockStack>
            </Card>
          </Box>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
