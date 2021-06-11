import { gql } from "@apollo/client";

export const GET_ORDERS_ETIQUETA = gql`
  query getOrders {
    orders(
      first: 150
      reverse: true
      query: "-fulfillment_status:unfulfilled AND financial_status:paid AND tag:CARG_ETIQUETA"
    ) {
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


export const GET_ORDERS_PENDIENTE = gql`
  query getOrders {
    orders(first: 150, query: "tag:CARG_PENDIENTE financial_status:paid") {
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