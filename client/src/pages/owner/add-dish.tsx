import { gql, useMutation } from "@apollo/client";
import { Helmet } from "react-helmet-async";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "../../components/button";
import { createDish, createDishVariables } from "../../__generated__/createDish";
import { MY_RESTAURANT_QUERY } from "./my-restaurant";

const CREATE_DISH_MUTATION = gql`
    mutation createDish($input: CreateDishInput!) {
        createDish(input:$input) {
            ok
            error
        }
    }
`;

interface IForm {
    name: string;
    price: string;
    description: string;
};

export const AddDish = () => {
    const params = useParams();
    const restaurantId = params.id + "";
    const navigate = useNavigate();
    const [createDishMutation, { loading }] = useMutation<
        createDish,
        createDishVariables
    >(CREATE_DISH_MUTATION, {
        refetchQueries: [
            {
                query: MY_RESTAURANT_QUERY,
                variables: {
                    input: {
                        id: +restaurantId
                    }
                }
            }
        ]
    });

    const { register, handleSubmit, formState, getValues } = useForm<IForm>({
        mode: "onChange",
    });

    const onSubmit = () => {
        const { name, price, description } = getValues();
        createDishMutation({
            variables: {
                input: {
                    name,
                    price: +price,
                    description,
                    restaurantId: +restaurantId,
                },
            },
        });
        navigate(-1);
    };

    return (
        <div className="container flex flex-col items-center mt-52">
          <Helmet>
            <title>Add Dish | Nuber Eats</title>
          </Helmet>
          <h4 className="font-semibold text-2xl mb-3">Add Dish</h4>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="grid max-w-screen-sm gap-3 mt-5 w-full mb-5"
          >
            <input
              {...register('name', {required:"Name is required."})}
              className="input"
              type="text"
              placeholder="Name"
            />
            <input
              {...register('price', {required:"Price is required."})}
              className="input"
              type="number"
              min={0}
              placeholder="Price"
            />
            <input
              {...register('description', {required:"Description is required."})}
              className="input"
              type="text"
              placeholder="Description"
            />
            <Button
              loading={loading}
              canClick={formState.isValid}
              actionText="Create Dish"
            />
          </form>
        </div>
      );
};