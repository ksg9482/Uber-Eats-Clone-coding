import { Args, Mutation, Query, Resolver } from "@nestjs/graphql";
import { createRestaurantDto } from "./dtos/create-restaurant.dto";
import { Restaurants } from "./entities/restaurants.entity";


@Resolver(of => Restaurants)
export class RestaurantsResolver {

    @Query(returns => [Restaurants]/*GraphQL의 방법 */)
    myRestaurants(@Args('veganOnly')/*GraphQL을 위한 부분*/ veganOnly: Boolean/*function을 위한 부분*/): Restaurants[]/*TypeScrpit의 방법 */ {
        return [];
    }

    @Mutation(returns => Boolean)
    createRestaurant(
       //@Args('createRestaurentDto') createRestaurantDto: createRestaurantDto //이게 InputType으로 쓸 때
       @Args() createRestaurantDto: createRestaurantDto
       ): Boolean{
        return true
    }



    
}