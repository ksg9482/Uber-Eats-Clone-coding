/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { CreateAccountInput } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: createAccountMutaion
// ====================================================

export interface createAccountMutaion_createAccount {
  __typename: "CreateAccountOutput";
  ok: boolean;
  error: string | null;
}

export interface createAccountMutaion {
  createAccount: createAccountMutaion_createAccount;
}

export interface createAccountMutaionVariables {
  CreateAccountInput: CreateAccountInput;
}
