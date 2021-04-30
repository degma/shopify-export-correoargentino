import { useQuery, gql, useMutation } from "@apollo/client";
import { useEffect, useState, useCallback } from "react";
import {
  Page,
  TextStyle,
  ResourceList,
  ResourceItem,
  Card,
  Stack,
  Badge,
  IndexTable,
  useIndexResourceState,
} from "@shopify/polaris";
import * as XLSX from "xlsx";

const GET_ORDERS = gql`
query getOrders {
  orders(first: 150, query: "tag:CARG_ETIQUETA fulfillment_status:fulfilled") {
    edges {
      node {
        id
        name
        subtotalPrice
        createdAt
        fulfillments {
          id
        }
        displayFulfillmentStatus
        customer {
          displayName
          email
        }
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

const EditTrackingInfo = () => {
  const { loading, error, data } = useQuery(GET_ORDERS);
  const [columns, setColumns] = useState([]);
  const [shippingData, setShippingData] = useState([]);
  const [ordersData, setOrdersData] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);

  useEffect(() => {
    setOrdersData([]);
    if (data) {
      let updatedData = data.orders.edges.map(({ node: order }) => {
        return {
          id: order.id,
          pedido: order.name,
          fulfillmentId: order.fulfillments ? order.fulfillments.id : "",
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

        // remove the blank rows
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
    console.log("Buscando...");
    ordersData.forEach((order, index) => {
      shippingData.forEach((envio) => {
        if (`#${envio.pedido}` === order.pedido) {
          console.log("ENCONTRADO");
          let updatedOrder = order;
          updatedOrder.tn = envio.TN;
          updatedOrder.estado = envio.Estado;
          console.log(index, updatedOrder);
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

  const {
    selectedResources,
    allResourcesSelected,
    handleSelectionChange,
  } = useIndexResourceState(shippingData);

  const rowMarkup = shippingData.map(
    ({ pedido, TN, Fecha, Estado, Destino }, index) => (
      <IndexTable.Row
        id={pedido}
        key={TN}
        selected={selectedResources.includes(pedido)}
        position={index}
      >
        <IndexTable.Cell>
          <TextStyle variation="strong">{pedido}</TextStyle>
        </IndexTable.Cell>
        <IndexTable.Cell>{TN}</IndexTable.Cell>
        <IndexTable.Cell>{Estado}</IndexTable.Cell>
        <IndexTable.Cell>{Destino}</IndexTable.Cell>
      </IndexTable.Row>
    )
  );

  return (
    <Page title="Actualizar información de Envíos">
      <Card>
        <input
          type="file"
          accept=".csv,.xlsx,.xls"
          onChange={handleFileUpload}
        />
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
            <TextStyle variation="strong">{pedido}</TextStyle>
          </h3>
          <div>{customer}</div>
        </Stack.Item>
        <Stack.Item>
          <TextStyle variation="strong">{tn}</TextStyle>
          <div>{estado}</div>
        </Stack.Item>
        <Stack.Item>
          <Badge
            size="small"
            status={fulfillmentStatus == "FULFILLED" ? "success" : "warning"}
          >
            {fulfillmentStatus.toLowerCase()}
          </Badge>
        </Stack.Item>
      </Stack>
    </ResourceItem>
  );
}

export default EditTrackingInfo;
