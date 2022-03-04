import { Args, Mutation, Query, Resolver } from "@nestjs/graphql";
import { number } from "joi";
import { CreateRestaurantDto } from "./dtos/create-restaurant.dto";
import { UpdateRestaurantDto } from "./dtos/update-restaurant.dto";
import { Restaurant } from "./entities/restaurant.entity";
import { RestaurantsService } from "./restaurants.service";


@Resolver(of => Restaurant)
export class RestaurantsResolver {
    constructor(private readonly restaurantsService: RestaurantsService) {}
    
    @Query(returns => [Restaurant]/*GraphQL의 방법 */)
    restaurants(): Promise<Restaurant[]>/*TypeScrpit의 방법 */ {
        return this.restaurantsService.getAll();
    }

    @Mutation(returns => Boolean)
    async createRestaurant(
       @Args('input') createRestaurantDto: CreateRestaurantDto
       ): Promise<Boolean>{
        try {
            await this.restaurantsService.createRestaurant(createRestaurantDto);
            return true;
        } catch (error) {
            console.log(error)
            return false;
        }
        
    }

    @Mutation(returns => Boolean)
    async updateRetaurant(
        @Args() updateRetaurantDto: UpdateRestaurantDto
    ){
       try {
           await this.restaurantsService.updateRestaurant(updateRetaurantDto);
           return true
           
       } catch (error) {
           console.log(error)
           return false
       }
    }



    
}