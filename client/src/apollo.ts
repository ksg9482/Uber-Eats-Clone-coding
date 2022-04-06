import {
    ApolloClient,
    InMemoryCache,
    ApolloProvider,
    useQuery,
    gql,
    makeVar
  } from "@apollo/client";

 export const isLoggedInVar = makeVar(false)
//property를 정의한다
export const client = new ApolloClient({
    uri: 'http://localhost:4000/graphql',
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
                return isLoggedInVar()
              }
            }
          }
        }
      }
    })
  });