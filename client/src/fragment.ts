import { gql } from "@apollo/client";


export const RESTAURANT_FRAGMENT = gql`
    fragment RestaurantParts on Restaurant {
        id
        name
        coverImg
        category {
            name
        }
        address
        isPromoted
    }
`;

export const CATEGORY_FRAGMENT = gql`
  fragment CategoryParts on Category {
    id
    name
    coverImg
    slug
    restaurantCount
  }
`;

//fragment만든 이유? 여러 쿼리문에 중복되는게 있다 -> 따로 빼서 불러오게 만든다