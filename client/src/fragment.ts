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

export const DISH_FRAGMENT = gql`
  fragment DishParts on Dish {
    id
    name
    price
    photo
    description
    options {
      name
      extra
      choices {
        name
        extra
      }
    }
  }
`;

export const ORDERS_FRAGMENT = gql`
  fragment OrderParts on Order {
    id
    createdAt
    total
  }
`;

export const FULL_ORDER_FRAGMENT = gql`
  fragment FullOrderParts on Order {
    id
    status
    total
    driver {
      email
    }
    customer {
      email
    }
    restaurant {
      name
    }
  }
`;

//fragment만든 이유? 여러 쿼리문에 중복되는게 있다 -> 따로 빼서 불러오게 만든다