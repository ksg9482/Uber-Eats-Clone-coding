import { gql, useLazyQuery } from "@apollo/client";
import React, { useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { useLocation, useNavigate } from "react-router-dom";
import { RESTAURANT_FRAGMENT } from "../../fragment";
import { searchRestaurant, searchRestaurantVariables } from "../../__generated__/searchRestaurant";

const SEARCH_RESTAURANT = gql`
    query searchRestaurant($input: SearchRestaurantInput!) {
        searchRestaurant(input: $input) {
        error
        ok
        totalPages
        totalResults
        restaurants {
            ...RestaurantParts
            }
        }
    }
    ${RESTAURANT_FRAGMENT}
`;

export const Search = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [callQuery, { loading, data, called }] = useLazyQuery<
        searchRestaurant,
        searchRestaurantVariables
    >(SEARCH_RESTAURANT);
    //lazyQuery - 바로 실행되는 것이 아니라 직접불러야 함. 
    //조건에 따라 query를 해야 할 필요가 있을때, 원하는 조건이 되면 query를 실행한다


    useEffect(() => {
        const [_, query] = location.search.split("?term=");
        if (!query) {
            return navigate('/', { replace: true });
        }
        callQuery({
            variables: {
                input: {
                    page: 1,
                    query
                }
            }
        });
    }, [navigate, location])
    return (
        <div>
            <Helmet>
                <title>Search | Nuber Eats</title>
            </Helmet>
            <h1>Search page</h1>
        </div>
    )
}