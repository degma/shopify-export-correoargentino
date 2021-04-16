import { useState } from "react";
import { EmptyState, Layout, Page } from "@shopify/polaris";
import { Modal, TitleBar } from "@shopify/app-bridge-react";
import store from "store-js";
import OrderList from "../components/OrderList";
import UserContext from "../components/UserContext";

const img = "https://cdn.shopify.com/s/files/1/0757/9955/files/empty-state.svg";

function Index() {
  const emptyState = false;
  return (
    <Page>
      <TitleBar title="Crear Envíos" />
      {emptyState ? (
        <Layout>
          <EmptyState
            heading="Exportar envíos de Correo Argentino"
            image={img}
          ></EmptyState>
          <OrderList />
        </Layout>
      ) : (
        <OrderList />
      )}
    </Page>
  );
}

export default Index;
