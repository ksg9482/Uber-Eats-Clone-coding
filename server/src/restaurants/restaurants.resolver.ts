import { Args, Mutation, Query, Resolver } from "@nestjs/graphql";
import { number } from "joi";
import { AuthUser } from "src/auth/auth-user.decorator";
import { User } from "src/users/entities/user.entity";
import { CreateRestaurantInput, CreateRestaurantOutput } from "./dtos/create-restaurant.dto";
import { Restaurant } from "./entities/restaurant.entity";
import { RestaurantsService } from "./restaurants.service";


@Resolver(of => Restaurant)
export class RestaurantsResolver {
    constructor(private readonly restaurantsService: RestaurantsService) { }


    @Mutation(returns => CreateRestaurantOutput)
    async createRestaurant(
        @AuthUser() authUser: User,
        @Args('input') CreateRestaurantInput: CreateRestaurantInput
    ): Promise<CreateRestaurantOutput> {

        return this.restaurantsService.createRestaurant(
            authUser, 
            CreateRestaurantInput
            );



    }

}