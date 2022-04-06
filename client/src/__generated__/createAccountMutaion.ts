/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { CreateAccountInput } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: createAccountMutaion
// ====================================================

export interface createAccountMutaion_login {
  __typename: "LoginOutput";
  ok: boolean;
  error: string | null;
}

export interface createAccountMutaion {
  login: createAccountMutaion_login;
}

export interface createAccountMutaionVariables {
  CreateAccountInput: CreateAccountInput;
}
