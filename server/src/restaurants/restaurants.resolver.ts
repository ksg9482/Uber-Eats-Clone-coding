import { SetMetadata } from "@nestjs/common";
import { Args, Mutation, Query, Resolver } from "@nestjs/graphql";
import { number } from "joi";
import { AuthUser } from "src/auth/auth-user.decorator";
import { Role } from "src/auth/role.decorator";
import { User, UserRole } from "src/users/entities/user.entity";
import { CreateRestaurantInput, CreateRestaurantOutput } from "./dtos/create-restaurant.dto";
import { Restaurant } from "./entities/restaurant.entity";
import { RestaurantsService } from "./restaurants.service";


@Resolver(of => Restaurant)
export class RestaurantsResolver {
    constructor(private readonly restaurantsService: RestaurantsService) { }


    @Mutation(returns => CreateRestaurantOutput)
    @Role(['Owner'])
    //@SetMetadata('role', UserRole.Owner) 
    //class혹은 function에 넣은 key를 이용해 metadata를 assign하는 decorator.
    //metadata는 Reflector class를 이용해 반영될 수 있다->metadata 접근가능
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