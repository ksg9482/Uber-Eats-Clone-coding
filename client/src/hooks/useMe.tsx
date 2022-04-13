import { gql, useQuery } from "@apollo/client";
import { meQuery } from "../__generated__/meQuery";


export const ME_QUERY = gql`
query meQuery {
  me {
      id
      email
      role
      verified
    }
  }
`;


//meQuery에서 id도 가져온 이유? Apollo는 type에 id속성이 있으면 model의 id로 쓰기 때문

export const useMe = () => {
    return useQuery<meQuery>(ME_QUERY);
}