import App from "next/app";
import Head from "next/head";
import { AppProvider } from "@shopify/polaris";
import { Provider } from "@shopify/app-bridge-react";
import Cookies from "js-cookie";
import "@shopify/polaris/dist/styles.css";
import translations from "@shopify/polaris/locales/en.json";
import ClientRouter from "../components/ClientRouter";
import {
  ApolloClient,
  InMemoryCache,
  ApolloProvider,
  createHttpLink,
} from "@apollo/client";
import UserContext from "../components/UserContext";
import { useState } from "react";

const client = new ApolloClient({
  link: new createHttpLink({
    credentials: "include",
    headers: {
      "Content-Type": "application/graphql",
    },
  }),
  cache: new InMemoryCache(),
});

function WithContext({ children }) {
  const [shipdata, setShipdata] = useState({ selected: "", envios: [] });
  return (
    <UserContext.Provider value={[shipdata, setShipdata]}>
      {children}
    </UserContext.Provider>
  );
}

class MyApp extends App {
  render() {
    const { Component, pageProps } = this.props;
    const config = {
      apiKey: API_KEY,
      shopOrigin: Cookies.get("shopOrigin"),
      forceRedirect: true,
    };

    return (
      <React.Fragment>
        <AppProvider i18n={translations}>
          <Head>
            <title>Export Correo Argentino</title>
            <meta charSet="utf-8" />
          </Head>
          <WithContext>
            <Provider config={config}>
              <ClientRouter />
              <ApolloProvider client={client}>
                <Component {...pageProps} />
              </ApolloProvider>
            </Provider>
          </WithContext>
        </AppProvider>
      </React.Fragment>
    );
  }
}

export default MyApp;
