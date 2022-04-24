/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { OrderStatus } from "./globalTypes";

// ====================================================
// GraphQL subscription operation: cookedOrder
// ====================================================

export interface cookedOrder_cookedOrder_driver {
  __typename: "User";
  email: string;
}

export interface cookedOrder_cookedOrder_customer {
  __typename: "User";
  email: string;
}

export interface cookedOrder_cookedOrder_restaurant {
  __typename: "Restaurant";
  name: string;
}

export interface cookedOrder_cookedOrder {
  __typename: "Order";
  id: number;
  status: OrderStatus;
  total: number | null;
  driver: cookedOrder_cookedOrder_driver | null;
  customer: cookedOrder_cookedOrder_customer | null;
  restaurant: cookedOrder_cookedOrder_restaurant | null;
}

export interface cookedOrder {
  cookedOrder: cookedOrder_cookedOrder;
}
