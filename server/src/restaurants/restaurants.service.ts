import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { CreateRestaurantDto } from "./dtos/create-restaurant.dto";
import { UpdateRestaurantDto } from "./dtos/update-restaurant.dto";
import { Restaurant } from "./entities/restaurant.entity";

@Injectable()
export class RestaurantsService {
    constructor(
        @InjectRepository(Restaurant) 
        private readonly restaurants: Repository<Restaurant>
        ) {}
    getAll(): Promise<Restaurant[]>{
        //find는 async method라 Promise를 써줘야 한다
        return this.restaurants.find() 
    }

    createRestaurant(createRestaurantDto: CreateRestaurantDto): Promise<Restaurant> {
        const newRestaurant = this.restaurants.create(createRestaurantDto);
        //create는 데이터베이스에 간섭하지 않는다.
        return this.restaurants.save(newRestaurant)//newRestaurant가 restaurants를 리턴하고 save는 promise를 리턴한다. 즉 Promise<Restaurant>
        //save를 쓰면 데이터베이스에 간섭한다
    }

    updateRestaurant({id, data}: UpdateRestaurantDto) {
        
        //update는 entity에서 어떠한 기준(criteria)이나 특징 같은 update하고 싶은 entitiy의 field를 보내야 한다. 그리고 update하고 싶은 data를 보내야 한다
        return this.restaurants.update(id, {...data});
        //update는 promise를 반환한다. update는 db에 해당 entity가 있는지 확인하지 않고 update query를 실행한다
        
    }
}