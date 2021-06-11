import React, { useContext, useEffect, useState } from "react";
import { Redirect } from "@shopify/app-bridge/actions";
import { useQuery, useMutation } from "@apollo/client";
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
  Banner,
  ProgressBar,
} from "@shopify/polaris";
import { Context } from "@shopify/app-bridge-react";
import UserContext from "./UserContext";
import { getFirestore } from "../firebase";
import { ADD_TAGS, REMOVE_TAGS } from "../utils/mutations";
import { GET_ORDERS_PENDIENTE } from "../utils/queries";

function OrderList() {
  const app = useContext(Context);
  const [shipdata, setShipdata] = useContext(UserContext);
  const [orderlist, setOrderlist] = useState([]);
  const [rotulos, setRotulos] = useState(0);
  const [progress, setProgress] = useState(-1);
  const { loading, error, data } = useQuery(GET_ORDERS_PENDIENTE);
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
        setOrderlist(ordenes);
      });
    }
  }, [data]);

  const redirectToOrder = () => {
    const redirect = Redirect.create(app);
    redirect.dispatch(Redirect.Action.APP, "/edit-shipping");
  };

  let rows = [];
  const exportToCsv = () => {
    setProgress(10);
    let rows = [];
    orderlist
      .filter((o) => o.rotulo === true)
      .forEach((order) => {
        rows.push(
          db
            .collection("rotulos")
            .doc(order.name.replace("#", ""))
            .get()
            .then((doc) => {
              return doc.data();
            })
        );
      });
    Promise.all(rows).then((values) => {
      const columnsNames = template.map((col) => col.name).join(";");
      const etiquetas = values.map((row) =>
        template
          .map((col) => (col.value !== undefined ? col.value : col.format(row)))
          .join(";")
      );
      let ids = values.map((a) => {
        return a.destinatario.split("PEDIDO")[1];
      });
      setTimeout(() => {
        setRotulos(etiquetas.length);
        download([columnsNames, ...etiquetas].join("\n"));
        setProgress(progress + 50);
      }, 1000);
      removeAndAddTags(ids);
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
  }

  function removeAndAddTags(param) {
    let tags = [];
    const processed = orderlist.filter((i) =>
      param.includes(i.name.replace("#", ""))
    );
    processed.map((order) => {
      tags.push(
        removeTag({
          variables: { id: order.id, tags: "CARG_PENDIENTE" },
        })
      );
      tags.push(
        addTag({
          variables: { id: order.id, tags: "CARG_ETIQUETA" },
        })
      );
    });

    Promise.all(tags).then(() => {
      const arr = orderlist.filter(
        (i) => !param.includes(i.name.replace("#", ""))
      );
      setProgress(90);
      setTimeout(() => {
        setOrderlist(arr);
        setProgress(100);
      }, 1000);
    });
  }

  if (error) return `Error! ${error.message}`;

  return (
    <>
      {rotulos > 0 && progress === 100 ? (
        <div className="banner-space">
          <Banner
            title={`Archivo generado correctamente! Se generaron ${rotulos} etiquetas de envío.`}
            status="success"
            onDismiss={() => {
              setRotulos(0);
            }}
          />
        </div>
      ) : (
        ""
      )}

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
        {progress > 0 && progress !== 100 ? (
          <ProgressBar progress={progress} size="small" />
        ) : (
          ""
        )}
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
                          displayFinancialStatus == "PAID"
                            ? "success"
                            : "warning"
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
    </>
  );
}

export default OrderList;
