/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { OrderStatus } from "./globalTypes";

// ====================================================
// GraphQL subscription operation: coockedOrder
// ====================================================

export interface coockedOrder_cookedOrder_driver {
  __typename: "User";
  email: string;
}

export interface coockedOrder_cookedOrder_customer {
  __typename: "User";
  email: string;
}

export interface coockedOrder_cookedOrder_restaurant {
  __typename: "Restaurant";
  name: string;
}

export interface coockedOrder_cookedOrder {
  __typename: "Order";
  id: number;
  status: OrderStatus;
  total: number | null;
  driver: coockedOrder_cookedOrder_driver | null;
  customer: coockedOrder_cookedOrder_customer | null;
  restaurant: coockedOrder_cookedOrder_restaurant | null;
}

export interface coockedOrder {
  cookedOrder: coockedOrder_cookedOrder;
}
