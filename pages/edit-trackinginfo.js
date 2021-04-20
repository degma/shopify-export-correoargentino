import { useQuery, gql, useMutation } from "@apollo/client";
import { useEffect} from 'react'
import {
    Card,
    Page,
    DataTable
  } from "@shopify/polaris";



const GET_ORDERS = gql`
  query getOrders {
    orders(
      first: 100
      reverse: true
      query: "displayFinancialStatus:PAID AND tag:'CARG_ETIQUETA'"
    ) {
      edges {
        node {
          id
          name
          createdAt
          customer {
            displayName
            email
          }
          fulfillments {
            id
          }
          displayFinancialStatus
          displayFulfillmentStatus
          shippingAddress {
            id
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
  useEffect(() => {
    console.log(data);
  }, [data]);
  return (
    <Page title="Sales by product">
      <Card>
        <DataTable
          columnContentTypes={[
            "text",
            "numeric",
            "numeric",
            "numeric",
            "numeric",
          ]}
          headings={[
            "Product",
            "Price",
            "SKU Number",
            "Net quantity",
            "Net sales",
          ]}
          rows={[]}
          totals={["", "", "", 255, "$155,830.00"]}
        />
      </Card>
    </Page>
  );
};

export default EditTrackingInfo;
