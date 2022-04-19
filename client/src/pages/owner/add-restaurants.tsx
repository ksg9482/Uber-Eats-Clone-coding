import { gql, useApolloClient, useMutation } from "@apollo/client";
import React, { useState } from "react";
import { Helmet } from "react-helmet-async";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { Button } from "../../components/button";
import { FormError } from "../../components/form-error";
import {
  createRestaurant,
  createRestaurantVariables,
} from "../../__generated__/createRestaurant";
import { CREATEACCOUNT_MUTATION } from "../create-account";
import { MY_RESTAURANTS_QUERY } from "./my-restraurants";

export const CREATERESTAURANT_MUTATION = gql`
  mutation createRestaurant($input: CreateRestaurantInput!) {
    createRestaurant(input: $input) {
      error
      ok
      restaurantId
    }
  }
`;

interface IFormProps {
  name: string;
  address: string;
  categoryName: string;
  file:FileList;
}

export const AddRestaurant = () => {
  const client = useApolloClient();
  const navigate = useNavigate();
  const [uploading, setUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState("");

  const onCompleted = (data:createRestaurant) => {
    const {
      createRestaurant: {
        ok, 
        restaurantId
      }
    } = data;
    if(ok) {
      const { name, categoryName, address } = getValues();
      setUploading(false);
      const queryResult = client.readQuery({ query: MY_RESTAURANTS_QUERY });
      client.writeQuery({
        query: MY_RESTAURANTS_QUERY,
        data: {
          myRestaurants: {
            ...queryResult.myRestaurants,
            restaurants: [
              {
                address,
                category: {
                  name: categoryName,
                  __typename: "Category",
                },
                coverImg: imageUrl,
                id: restaurantId,
                isPromoted: false,
                name,
                __typename: "Restaurant",
              },
              ...queryResult.myRestaurants.restaurants,
            ],
          },
        },
      });
      navigate('/', {replace:true})
    }
  };
  const [createRestaurantMutation, { loading, data }] = useMutation<
    createRestaurant,
    createRestaurantVariables
  >(CREATERESTAURANT_MUTATION, {
    onCompleted
  });
  const {
    register,
    getValues,
    formState:{isValid},
    handleSubmit,
  } = useForm<IFormProps>({
    mode: "onChange",
  });
  
  const onSubmit = async () => {
    try {
      setUploading(true);
      const {
        name,
        address,
        categoryName,
        file
      } = getValues();

      const actualFile = file[0] //array로 들어가있음
      const formBody = new FormData();
      formBody.append("file", actualFile);

      const {url:coverImg} = await (
        await fetch("http://localhost:4000/uploads/", {
          method: "post",
          body: formBody
        })
      ).json()

      createRestaurantMutation({
        variables: {
          input: {
            name,
            address,
            categoryName,
            coverImg
          }
        }
      });
    } catch (error) {
      
    }
  };
  return (
    <div className="container flex flex-col items-center mt-52">
      <Helmet>
        <title>Add Restaurant | Nuber Eats</title>
      </Helmet>
      <h4 className="font-semibold text-2xl mb-3">Add Restaurant</h4>
      <form 
      className="grid max-w-screen-sm gap-3 mt-5 w-full mb-5"
      onSubmit={handleSubmit(onSubmit)}
      >
        <input
          {...register("name", {required:true})}
          className="input"
          type="text"
          placeholder="Name"
        />
        <input
          {...register("address", {required:true})}
          className="input"
          type="text"
          placeholder="Address"
        />
        <input
          {...register("categoryName", {required:true})}
          className="input"
          type="text"
          placeholder="Category Name"
        />
        <div>
          <input
          {...register("file", {required:true})}
          type="file"
          name="file"
          accept="image/*"
          />
        </div>
        <Button
          loading={uploading}
          canClick={isValid}
          actionText="Create Restaurant"
        />
        {data?.createRestaurant?.error && (
          <FormError errorMessage={data.createRestaurant.error} />
        )}
      </form>
    </div>
  );
};