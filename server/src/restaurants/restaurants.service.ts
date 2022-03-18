import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "src/users/entities/user.entity";
import { Repository } from "typeorm";
import { CreateRestaurantInput, CreateRestaurantOutput } from "./dtos/create-restaurant.dto";
import { Restaurant } from "./entities/restaurant.entity";

@Injectable()
export class RestaurantsService {
    constructor(
        @InjectRepository(Restaurant) 
        private readonly restaurants: Repository<Restaurant>
        ) {}
    
    async createRestaurant(
        owner: User,
        createRestaurantInput: CreateRestaurantInput
        ): Promise<CreateRestaurantOutput> {
        try {
            const newRestaurant = this.restaurants.create(createRestaurantInput);
        //create는 데이터베이스에 간섭하지 않는다.
        await this.restaurants.save(newRestaurant)//newRestaurant가 restaurants를 리턴하고 save는 promise를 리턴한다. 즉 Promise<Restaurant>
        return {
            ok: true
        }
        //save를 쓰면 데이터베이스에 간섭한다
        } catch (error) {
            return {
                ok:false,
                error: "could not create restaurant"
            }
        }
    }

}