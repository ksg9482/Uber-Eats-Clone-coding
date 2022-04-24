import { gql, useMutation, useQuery } from "@apollo/client";
import React, { useState } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate, useParams } from "react-router-dom";
import { Dish } from "../../components/dish";
import { DishOption } from "../../components/dish-option";
import { DISH_FRAGMENT, RESTAURANT_FRAGMENT } from "../../fragment";
import { createOrder, createOrderVariables } from "../../__generated__/createOrder";
import { CreateOrderItemInput } from "../../__generated__/globalTypes";
import { restaurant, restaurantVariables } from "../../__generated__/restaurant";

const RESTAURANT_QUERY = gql`
    query restaurant($input: RestaurantInput!) {
        restaurant(input: $input) {
            ok
            error
            restaurant {
                ...RestaurantParts
                menu {
                  ...DishParts
                }
            }
        }
    }
    ${RESTAURANT_FRAGMENT}
    ${DISH_FRAGMENT}
`;

const CREATE_ORDER_MUTATION = gql`
  mutation createOrder($input: CreateOrderInput!) {
    createOrder(input: $input) {
      ok
      error
      orderId
    }
  }
`;

interface IRestaurantParams {
  id: string;
}

export const Restaurant = () => {
  const navigate = useNavigate();

  const [orderStarted, setOrderStarted] = useState(false);
  const [orderItems, setOrderItems] = useState<CreateOrderItemInput[]>([]);

  const params = useParams();
  const id = params.id + ""
  const { loading, data } = useQuery<
    restaurant,
    restaurantVariables
  >(RESTAURANT_QUERY, {
    variables: {
      input: {
        restaurantId: +id
      }
    }
  })

  const triggerStartOrder = () => {
    setOrderStarted(true);
  };


  const getItem = (dishId: number) => {
    return orderItems.find((order) => order.dishId === dishId);
  }
  const isSelected = (dishId: number) => {
    return Boolean(getItem(dishId))
  };


  const addItemToOrder = (dishId: number) => {
    if (isSelected(dishId)) {
      return;
    }
    setOrderItems((current) => [{ dishId, options: [] }, ...current]);
  };
  const removeFromOrder = (dishId: number) => {
    setOrderItems((current) =>
      current.filter((dish) => dish.dishId !== dishId)
    );
  };

  const addOptionToItem = (dishId: number, optionName: string) => {
    if (!isSelected) {
      return;
    };
    const oldItem = getItem(dishId);
    if (oldItem) {
      const hasOption = Boolean(
        oldItem.options?.find((aOption) => aOption.name === optionName)
      );
      if (!hasOption) {
        removeFromOrder(dishId);
        setOrderItems((current) => [
          {
            dishId,
            options: [{ name: optionName }, ...oldItem.options!],
            ...current
          }
        ]);
        //삭제하고 다시 만드는 이유? -> state를 mutate하지 않기 위함
        //항상 새 state를 만들고 return 할 것
        //1. react는 새 state를 확인하고 re-render하는 것이 쉽다
        //2. state를 mutate하면 react는 state에 아무 변화도 없었다 판단할 수 있다
      }
    };
  };

  const removeOptionFromItem = (dishId: number, optionName: string) => {
    //item은 state로부터 오기에 filter로 제거하는 건 충분하지 않다
    //item을 제거하고 removeFromOrder, addOptionToItem에서 한 것과 비슷한 작업을 해야 함
    if (!isSelected(dishId)) {
      return;
    }
    const oldItem = getItem(dishId);
    if (oldItem) {
      removeFromOrder(dishId);
      setOrderItems((current) => [
        {
          dishId,
          options: oldItem.options?.filter(
            (option) => option.name !== optionName
          )
        },
        ...current
      ])
      return ;
    }
  }

  const getOptionFromItem = (
    item: CreateOrderItemInput,
    optionName: string
  ) => {
    return item.options?.find((option) => option.name === optionName);
  };

  const isOptionSelected = (dishId: number, optionName: string) => {
    const item = getItem(dishId);
    if (item) {
      return Boolean(getOptionFromItem(item, optionName));
    }
    return false;
  }

  const triggerCancelOrder = () => {
    setOrderStarted(false);
    setOrderItems([]);
  }

  

  const onCompleted = (data: createOrder) => {
    const {
      createOrder: {ok, orderId}
    } = data;
    if(data.createOrder.ok) {
      navigate(`/orders/${orderId}`);
    }
  };

  const [createOrderMutation, { loading: placingOrder }] = useMutation<
    createOrder,
    createOrderVariables
  >(CREATE_ORDER_MUTATION, {
    onCompleted,
  });

  const triggerConfirmOrder = () => {
    if(placingOrder) {
      return;
    }
    if (orderItems.length === 0) {
      alert("Can't place empty order");
      return;
    }
    const ok = window.confirm("You are about to place an order");
    if (ok) {
      createOrderMutation({
        variables: {
          input: {
            restaurantId: +id,
            items: orderItems,
          },
        },
      });
    }
  };

  
  return (
    <div>
      <Helmet>
        <title>{data?.restaurant.restaurant?.name || ""} | Nuber Eats</title>
      </Helmet>
      <div
        className=" bg-gray-800 bg-center bg-cover py-48"
        style={{
          backgroundImage: `url(${data?.restaurant.restaurant?.coverImg})`,
        }}
      >
        <div className="bg-white xl:w-3/12 py-8 pl-48">
          <h4 className="text-4xl mb-3">{data?.restaurant.restaurant?.name}</h4>
          <h5 className="text-sm font-light mb-2">
            {data?.restaurant.restaurant?.category?.name}
          </h5>
          <h6 className="text-sm font-light">
            {data?.restaurant.restaurant?.address}
          </h6>
        </div>
      </div>
      <div className="container pb-32 flex flex-col items-end mt-20">
      {!orderStarted && (
          <button onClick={triggerStartOrder} className="btn px-10">
            Start Order
          </button>
        )}
        {orderStarted && (
          <div className="flex items-center">
            <button onClick={triggerConfirmOrder} className="btn px-10 mr-3">
              Confirm Order
            </button>
            <button
              onClick={triggerCancelOrder}
              className="btn px-10 bg-black hover:bg-black"
            >
              Cancel Order
            </button>
          </div>
        )}
        <div className="w-full grid mt-16 md:grid-cols-3 gap-x-5 gap-y-10">
          {data?.restaurant.restaurant?.menu.map((dish, index) => (
            <Dish
              id={dish.id}
              orderStarted={orderStarted}
              key={index}
              name={dish.name}
              description={dish.description}
              price={dish.price}
              isCustomer={true}
              options={dish.options}
              isSelected={isSelected(dish.id)}
              addItemToOrder={addItemToOrder}
              removeFromOrder={removeFromOrder}
            >
              {dish.options?.map((option, index) => (
                <DishOption 
                  key={index}
                  dishId={dish.id}
                  name={option.name}
                  extra={option.extra}
                  isSelected={isOptionSelected(dish.id, option.name)}
                  addOptionToItem={addOptionToItem}
                  removeOptionFromItem={removeOptionFromItem}
                />
              ))}
            </Dish>
          ))}
        </div>
      </div>
    </div>
  )
}