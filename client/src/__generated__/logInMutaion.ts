/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { LoginInput } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: logInMutaion
// ====================================================

export interface logInMutaion_login {
  __typename: "LoginOutput";
  ok: boolean;
  error: string | null;
  token: string | null;
}

export interface logInMutaion {
  login: logInMutaion_login;
}

export interface logInMutaionVariables {
  loginInput: LoginInput;
}
