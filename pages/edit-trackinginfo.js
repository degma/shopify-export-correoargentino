import { useQuery, useMutation } from "@apollo/client";
import { useEffect, useState } from "react";
import {
  Page,
  TextStyle,
  ResourceList,
  ResourceItem,
  Card,
  Stack,
  Badge,
  Button,
  Caption,
  Banner,
} from "@shopify/polaris";
import * as XLSX from "xlsx";
import {
  ADD_TAGS,
  REMOVE_TAGS,
  UPDATE_TRACKING_INFO,
} from "../utils/mutations";
import { GET_ORDERS_ETIQUETA } from "../utils/queries";

const EditTrackingInfo = () => {
  const { loading, error, data } = useQuery(GET_ORDERS_ETIQUETA);
  const [columns, setColumns] = useState([]);
  const [shippingData, setShippingData] = useState([]);
  const [ordersData, setOrdersData] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [fulfillmentTrackingInfoUpdateV2] = useMutation(UPDATE_TRACKING_INFO);
  const [removeTag] = useMutation(REMOVE_TAGS);
  const [addTag] = useMutation(ADD_TAGS);
  const [updatedOrders, setUpdatedOrders] = useState([]);

  useEffect(() => {
    setOrdersData([]);
    if (data) {
      let updatedData = data.orders.edges.map(({ node: order }) => {
        return {
          id: order.id,
          pedido: order.name,
          fulfillmentId: order.fulfillments[0] ? order.fulfillments[0].id : "",
          customer: order.shippingAddress ? order.shippingAddress.name : "",
          fulfillmentStatus: order.displayFulfillmentStatus,
        };
      });
      setOrdersData(updatedData);
    }
  }, [data]);
  // handle file upload
  // process CSV data

  const processData = (dataString) => {
    const dataStringLines = dataString.split(/\r\n|\n/);
    const headers = dataStringLines[0].split(
      /,(?![^"]*"(?:(?:[^"]*"){2})*[^"]*$)/
    );

    const list = [];
    for (let i = 1; i < dataStringLines.length; i++) {
      const row = dataStringLines[i].split(
        /,(?![^"]*"(?:(?:[^"]*"){2})*[^"]*$)/
      );
      if (headers && row.length == headers.length) {
        const obj = {};
        for (let j = 0; j < headers.length; j++) {
          let d = row[j];
          if (d.length > 0) {
            if (d[0] == '"') d = d.substring(1, d.length - 1);
            if (d[d.length - 1] == '"') d = d.substring(d.length - 2, 1);
          }
          if (headers[j]) {
            obj[headers[j]] = d;
          }
        }
        if (Object.values(obj).filter((x) => x).length > 0) {
          obj.pedido = obj.Destino.split("PEDIDO")[1];
          obj.TN = obj.TN.replace(" ", "");
          list.push(obj);
        }
      }
    }

    // prepare columns list from headers
    const columns = headers.map((c) => ({
      name: c,
      selector: c,
    }));

    setShippingData(list);
    setColumns(columns);
  };

  useEffect(() => {
    ordersData.forEach((order) => {
      shippingData.forEach((envio) => {
        if (`#${envio.pedido}` === order.pedido) {
          let updatedOrder = order;
          updatedOrder.tn = envio.TN.replace(/\s/g, "");
          updatedOrder.estado = envio.Estado.replace(/\s+$/, "");
        }
      });
    });
  }, [shippingData]);

  // handle file upload
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = (evt) => {
      /* Parse data */
      const bstr = evt.target.result;
      const wb = XLSX.read(bstr, { type: "binary" });
      /* Get first worksheet */
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      /* Convert array of arrays */
      const data = XLSX.utils.sheet_to_csv(ws, { header: 1 });
      processData(data);
    };
    reader.readAsBinaryString(file);
  };

  const resourceName = {
    singular: "envio",
    plural: "envios",
  };

  const updateTrackingInfo = () => {
    ordersData
      .filter(
        (order) =>
          order.tn &&
          !order.estado.includes("PREIMPOSICION") &&
          !order.estado.includes("CANCELADA") &&
          order.fulfillmentId
      )
      .forEach((order) => {
        fulfillmentTrackingInfoUpdateV2({
          variables: {
            fulfillmentId: order.fulfillmentId,
            notifyCustomer: true,
            trackingInfoInput: {
              url: "https://www.correoargentino.com.ar/formularios/e-commerce",
              number: order.tn,
            },
          },
        })
          .then(() => {
            addTag({ variables: { id: order.id, tags: "CARG_ENVIADO" } }).then(
              () => {
                removeTag({
                  variables: { id: order.id, tags: "CARG_ETIQUETA" },
                }).then(() => {
                  setUpdatedOrders((oldArray) => [...oldArray, order.pedido]);
                });
              }
            );
          })
          .catch((err) => console.error(err));
      });
  };

  useEffect(() => {
    if (ordersData) {
      console.log(ordersData);
      const arr = ordersData.filter((i) => !updatedOrders.includes(i.pedido));
      console.log("ARRAY", arr);
      setOrdersData(arr);
    }
    console.log(updatedOrders);
  }, [updatedOrders]);

  return (
    <Page title="Actualizar información de Envíos">
      {updatedOrders.length > 0 ? (
        <div className="banner-space">
          <Banner
            title={`Se actualizaron ${updatedOrders.length} envíos.`}
            status="success"
            onDismiss={() => {
              setUpdatedOrders([]);
            }}
          />
        </div>
      ) : (
        ""
      )}
      <Card>
        <Card.Section>
          <Stack>
            <Stack.Item fill>
              <TextStyle variation="subdued">
                {ordersData.length} pedidos para enviar por Correo Argentino.
              </TextStyle>
            </Stack.Item>
            <Stack.Item>
              <Button
                primary
                onClick={updateTrackingInfo}
                disabled={
                  (ordersData.length > 0 && shippingData.length > 0) ||
                  updatedOrders > 0
                    ? false
                    : true
                }
              >
                Actualizar Tracking Info
              </Button>
            </Stack.Item>
          </Stack>
        </Card.Section>
        <Card.Section>
          <input
            type="file"
            accept=".csv,.xlsx,.xls"
            onChange={handleFileUpload}
          />
        </Card.Section>
      </Card>
      <Card>
        <ResourceList
          resourceName={resourceName}
          items={ordersData}
          renderItem={renderItem}
          selectedItems={selectedItems}
          onSelectionChange={setSelectedItems}
          loading={loading}
        />
      </Card>
    </Page>
  );
};

function renderItem(item, _, index) {
  const {
    id,
    pedido,
    fulfillmentId,
    customer,
    fulfillmentStatus,
    estado,
    tn,
    tnStatus,
  } = item;

  return (
    <ResourceItem
      id={id}
      sortOrder={index}
      accessibilityLabel={`View details for ${pedido}`}
    >
      <Stack>
        <Stack.Item fill>
          <h3>
            <TextStyle variation="strong">
              Pedido {pedido} - {customer}
            </TextStyle>
          </h3>

          <Caption>
            <Badge
              size="small"
              status={fulfillmentStatus == "FULFILLED" ? "success" : "warning"}
            >
              {fulfillmentStatus.toLowerCase()}
            </Badge>
            {tn ? `TN:${tn} (${estado})` : ""}
          </Caption>
        </Stack.Item>
        <Stack.Item>
          {tnStatus ? (
            <Badge size="small" status="success">
              Actualizado
            </Badge>
          ) : (
            ""
          )}
        </Stack.Item>
      </Stack>
    </ResourceItem>
  );
}

export default EditTrackingInfo;
