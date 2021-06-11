import { gql } from "@apollo/client";

export const REMOVE_TAGS = gql`
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
export const ADD_TAGS = gql`
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


export const UPDATE_TRACKING_INFO = gql`
  mutation fulfillmentTrackingInfoUpdateV2(
    $fulfillmentId: ID!
    $trackingInfoInput: FulfillmentTrackingInput!
  ) {
    fulfillmentTrackingInfoUpdateV2(
      fulfillmentId: $fulfillmentId
      trackingInfoInput: $trackingInfoInput
    ) {
      fulfillment {
        id
      }
      userErrors {
        field
        message
      }
    }
  }
`;
