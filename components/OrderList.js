import React, { useContext, useEffect, useState } from "react";
import { Redirect } from "@shopify/app-bridge/actions";
import { useQuery, gql, useMutation } from "@apollo/client";
import { CircleTickMajor } from "@shopify/polaris-icons";
import template from "../utils/template";
import {
  Icon,
  TextStyle,
  Card,
  ResourceItem,
  ResourceList,
  Badge,
  Stack,
  Caption,
  Button,
} from "@shopify/polaris";
import { Context } from "@shopify/app-bridge-react";
import UserContext from "./UserContext";
import { getFirestore } from "../firebase";

const GET_ORDERS = gql`
  query getOrders {
    orders(
      first: 100
      reverse: true
      query: "displayFinancialStatus:'PAID' AND tag:'CARG_PENDIENTE'"
    ) {
      edges {
        node {
          id
          name
          subtotalPrice
          createdAt
          customer {
            displayName
            email
          }
          displayFinancialStatus
          displayFulfillmentStatus
          shippingAddress {
            name
            address1
            address2
            city
            zip
            phone
            provinceCode
            province
          }
        }
      }
    }
  }
`;
const REMOVE_TAGS = gql`
  mutation tagsRemove($id: ID!, $tags: [String!]!) {
    tagsRemove(id: $id, tags: $tags) {
      node {
        id
      }
      userErrors {
        field
        message
      }
    }
  }
`;
const ADD_TAGS = gql`
  mutation tagsAdd($id: ID!, $tags: [String!]!) {
    tagsAdd(id: $id, tags: $tags) {
      node {
        id
      }
      userErrors {
        field
        message
      }
    }
  }
`;

function OrderList() {
  const app = useContext(Context);
  const [shipdata, setShipdata] = useContext(UserContext);
  const [orderlist, setOrderlist] = useState([]);
  const [load, setLoad] = useState(false);

  const { loading, error, data } = useQuery(GET_ORDERS);
  const [removeTag] = useMutation(REMOVE_TAGS);
  const [addTag] = useMutation(ADD_TAGS);

  const db = getFirestore();

  useEffect(() => {
    setOrderlist([]);
    let ordenes = [];
    if (data) {
      Promise.all(
        data.orders.edges.map(async ({ node: order }) => {
          await db
            .collection("rotulos")
            .doc(order.name.replace("#", ""))
            .get()
            .then((doc) => {
              ordenes.push({ ...order, rotulo: doc.exists });
            });
        })
      ).then(() => {
        console.log(ordenes);
        setOrderlist(ordenes);
      });
    }
  }, [data]);

  const redirectToOrder = () => {
    const redirect = Redirect.create(app);
    redirect.dispatch(Redirect.Action.APP, "/edit-shipping");
    setLoad(false);
  };

  const exportToCsv = () => {
    let rows = [];
    Promise.all(
      orderlist.map(async (order) => {
        if ((order.rotulo = true)) {
          await db
            .collection("rotulos")
            .doc(order.name.replace("#", ""))
            .get()
            .then((doc) => {
              rows.push(doc.data());
            });
        }
      })
    ).then(() => {
      const columnsNames = template.map((col) => col.name).join(";");
      const etiquetas = rows
        .filter((notUndefined) => notUndefined !== undefined)
        .map((row) =>
          template
            .map((col) =>
              col.value !== undefined ? col.value : col.format(row)
            )
            .join(";")
        );
      download([columnsNames, ...etiquetas].join("\n"));
    });
  };

  function download(filedata) {
    var element = document.createElement("a");
    element.setAttribute(
      "href",
      "data:text/csv;charset=utf-8," + encodeURIComponent(filedata)
    );
    element.setAttribute("download", "correo_argentino.csv");
    element.style.display = "none";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    removeAndAddTags(orderlist);
  }

  function removeAndAddTags(param) {
    Promise.all(
      param
        .filter((order) => order.rotulo == true)
        .map((order) => {
          removeTag({
            variables: { id: order.id, tags: "CARG_PENDIENTE" },
          });
          addTag({
            variables: { id: order.id, tags: "CARG_ETIQUETA" },
          });
        })
    );
    let updatedList = param.filter((order) => order.rotulo !== true);
    setOrderlist(updatedList);
  }

  // if (loading) return "Loading...";

  if (error) return `Error! ${error.message}`;

  return (
    <Card title="Envíos">
      <Card.Section>
        <Stack>
          <Stack.Item fill>
            <TextStyle variation="subdued">
              {orderlist.length} pedidos para enviar por Correo Argentino.
            </TextStyle>
          </Stack.Item>
          <Stack.Item>
            <Button primary onClick={exportToCsv}>
              Crear Archivo
            </Button>
          </Stack.Item>
        </Stack>
      </Card.Section>
      <Card.Section>
        <ResourceList
          resourceName={{ singular: "order", plural: "orders" }}
          loading={loading}
          items={orderlist}
          backdrop
          renderItem={(order) => {
            const {
              name,
              rotulo,
              subtotalPrice,
              customer,
              shippingAddress,
              displayFinancialStatus,
              displayFulfillmentStatus,
            } = order;
            return (
              <ResourceItem
                id={name}
                url={name}
                media={
                  <Icon
                    source={CircleTickMajor}
                    color={rotulo ? "success" : "warning"}
                    backdrop={true}
                  />
                }
                onClick={() => {
                  setShipdata({ ...shipdata, selected: order });
                  redirectToOrder();
                }}
              >
                <Stack>
                  <Stack.Item fill>
                    <h3>
                      <TextStyle variation="strong">
                        {name} - {customer ? customer.displayName : "null"}
                      </TextStyle>
                    </h3>
                    <Caption>
                      {shippingAddress ? shippingAddress.province : "NA"} |{" "}
                      {shippingAddress ? shippingAddress.address1 : "NA"}
                    </Caption>
                  </Stack.Item>
                  <Stack.Item>
                    <Badge
                      size="small"
                      status={
                        displayFinancialStatus == "PAID" ? "success" : "warning"
                      }
                    >
                      {displayFinancialStatus}
                    </Badge>
                  </Stack.Item>
                  <Stack.Item>
                    <Badge
                      size="small"
                      status={
                        displayFulfillmentStatus == "FULFILLED"
                          ? "success"
                          : "warning"
                      }
                    >
                      {displayFulfillmentStatus}
                    </Badge>
                  </Stack.Item>
                </Stack>
              </ResourceItem>
            );
          }}
        />
      </Card.Section>
    </Card>
  );
}

export default OrderList;
