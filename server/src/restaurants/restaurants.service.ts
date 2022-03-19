import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "src/users/entities/user.entity";
import { Repository } from "typeorm";
import { CreateRestaurantInput, CreateRestaurantOutput } from "./dtos/create-restaurant.dto";
import { Category } from "./entities/category.entity";
import { Restaurant } from "./entities/restaurant.entity";

@Injectable()
export class RestaurantsService {
    constructor(
        @InjectRepository(Restaurant) 
        private readonly restaurants: Repository<Restaurant>,
        @InjectRepository(Category) 
        private readonly categories: Repository<Category>
        ) {}
    
    async createRestaurant(
        owner: User,
        createRestaurantInput: CreateRestaurantInput
        ): Promise<CreateRestaurantOutput> {
        try {
            const newRestaurant = this.restaurants.create(createRestaurantInput);
        //create는 데이터베이스에 간섭하지 않는다.
        newRestaurant.owner = owner;
        const categoryName = createRestaurantInput.categodyName
        .trim() //앞뒤 빈칸을 제거 
        .toLowerCase()
        const categorySlug = categoryName.replace(/ /g, '-'); //regular expresstion을 만족시키기
        let category = await this.categories.findOne({slug: categorySlug});
        if(!category) {
            category = await this.categories.save(this.categories.create({slug: categorySlug, name:categoryName}))
        } 
        newRestaurant.category = category;
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