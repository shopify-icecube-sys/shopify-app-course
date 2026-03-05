import { Link, Links, Meta, Outlet, ScrollRestoration, Scripts } from "react-router";
import { AppProvider as PolarisAppProvider } from "@shopify/polaris";
import enTranslations from "@shopify/polaris/locales/en.json";
import "@shopify/polaris/build/esm/styles.css";

// Remix-compatible Link component for Polaris
function RemixLink(props: any) {
  const { url, external, target, download, children, ...rest } = props;

  // For external links or downloads, use a standard anchor tag
  if (external || download || (url && /^(?:[a-z][a-z\d+.-]*:|\/\/)/i.test(url))) {
    return (
      <a href={url} target={target} rel="noopener noreferrer" {...rest}>
        {children}
      </a>
    );
  }

  // For internal links, use React Router's Link
  return (
    <Link to={url} target={target} {...rest}>
      {children}
    </Link>
  );
}

export default function App() {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <link rel="preconnect" href="https://cdn.shopify.com/" />
        <link
          rel="stylesheet"
          href="https://cdn.shopify.com/static/fonts/inter/v4/styles.css"
        />
        <Meta />
        <Links />
      </head>
      <body>
        <PolarisAppProvider i18n={enTranslations} linkComponent={RemixLink}>
          <Outlet />
        </PolarisAppProvider>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}
