import {
    ApolloClient,
    InMemoryCache,
    ApolloProvider,
    useQuery,
    gql,
    makeVar,
    createHttpLink,
    split
  } from "@apollo/client";
import { setContext } from "@apollo/client/link/context"
import { WebSocketLink } from "@apollo/client/link/ws";
import { getMainDefinition } from "@apollo/client/utilities";
import { LOCALSTORAGE_TOKEN } from "./constants";

const token = localStorage.getItem(LOCALSTORAGE_TOKEN)
export const isLoggedInVar = makeVar(Boolean(token))
//property를 정의한다
export const authTokenVar = makeVar(token)
//맨처음: isLoggedInVar는 false, authToken는 null이다

const wsLink = new WebSocketLink({
  uri: `ws://localhost:4000/graphql`,
  options: {
    reconnect: true,
    connectionParams: {
      "x-jwt": authTokenVar() || "",
    },
  },
})

const httpLink = createHttpLink({
  uri: 'http://localhost:4000/graphql'
});

const authLink = setContext((_, {headers}) => {
  return {
    headers: {
      ...headers,
      'x-jwt': authTokenVar() || ""
    }
  }
});

const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query);
    return (
      definition.kind === "OperationDefinition" &&
      definition.operation === "subscription"
    );
  },
  wsLink,
  authLink.concat(httpLink)
);
//return이 true면 ws를, false면 http를 return한다


export const client = new ApolloClient({
  //link는 연결할 수 있는 것들. http, auth, web socket 링크를 가진다. 컨텍스트를 설정하는 것
    link:splitLink,
    cache: new InMemoryCache({//local state를 cache에 저장함
      typePolicies: {
        Query: {
          fields: {
            //field들은 function call read가 있어야 한다
            //read는 field의 값을 반환하는 함수
            isLoggedIn: {
              read() {
                //local storage에 token이 있을 때 login 되어있음을 알린다
                //return Boolean(localStorage.getItem("token"));
                return isLoggedInVar();
              }
            },
            token:{
              read() {
                return authTokenVar();
              }
            }
          }
        }
      }
    })
  });