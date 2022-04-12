import { gql, useQuery, useReactiveVar } from '@apollo/client';
import React from 'react';
import { isLoggedInVar } from '../apollo';
import { LoggedInRouter } from '../routers/logged-in-router';
import { LoggedOutRouter } from '../routers/logged-out-router';

//components에 옮긴 이유 -> 테스트하기 위해

export const App = () => {
  const isLoggedIn = useReactiveVar(isLoggedInVar)
  return isLoggedIn? <LoggedInRouter /> : <LoggedOutRouter />
}

