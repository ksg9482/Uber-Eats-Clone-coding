import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "src/users/entities/user.entity";
import { Repository } from "typeorm";
import { AllCategoriesOutPut } from "./dtos/all-categories.dto";
import { CategoryInput, CategoryOutput } from "./dtos/category.dto";
import { CreateRestaurantInput, CreateRestaurantOutput } from "./dtos/create-restaurant.dto";
import { DeleteRestaurantInput, DeleteRestaurantOutput } from "./dtos/delete-retaurant.dto";
import { EditRestaurantInput, EditRestaurantOutput } from "./dtos/edit-reastaurant.dto";
import { Category } from "./entities/category.entity";
import { Restaurant } from "./entities/restaurant.entity";
import { CategoryRepository } from "./repositories/category.repository";

@Injectable()
export class RestaurantsService {
    constructor(
        @InjectRepository(Restaurant) 
        private readonly restaurants: Repository<Restaurant>,
        private readonly categories: CategoryRepository//레포지토리를 따로 만들었으면 그걸로 해야 됨
        ) {}

    
    
    async createRestaurant(
        owner: User,
        createRestaurantInput: CreateRestaurantInput
        ): Promise<CreateRestaurantOutput> {
        try {
            const newRestaurant = this.restaurants.create(createRestaurantInput);
        //create는 데이터베이스에 간섭하지 않는다.
        newRestaurant.owner = owner;
        const category = await this.categories.getOrCreate(createRestaurantInput.categoryName)
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
    };

    async editRestaurant(
        owner: User, 
        editRestaurantInput: EditRestaurantInput): Promise<EditRestaurantOutput>
    {
        try {
            const restaurant = await this.restaurants.findOne(
                editRestaurantInput.restaurantId
                )
        if(!restaurant) {
            return {
                ok: false,
                error: 'restaurant not found'
            };
        };
        if(owner.id ! === restaurant.ownerId) {
            return {
                ok: false,
                error: "you can't edit a restaurant that you don't own."
            }
        }

        let category: Category = null;
        //editRestaurantInput를 categoryName없이 보내면 카테고리를 업데이트하고 싶지 않다는 뜻.
        if(editRestaurantInput.categoryName) {
            category = await this.categories.getOrCreate(
                editRestaurantInput.categoryName
                );
        }
        await this.restaurants.save([
            {
                id:editRestaurantInput.restaurantId,
                ...editRestaurantInput,
                ...(category && {category})
                //카테고리가 있으면 (Category인)category를 object를 리턴한다. 
                //...category만 쓰면 null로 업데이트 될수도 있음
            }
        ]);
        //ok
        return {
            ok:true
        };
        } catch (error) {
            return {
                ok: false,
                error: 'could not edit restaurant'
            }
        }
    };

    async deleteRestaurant(
        owner: User,
        {restaurantId}: DeleteRestaurantInput
    ):Promise<DeleteRestaurantOutput> {
        try {
            const restaurant = await this.restaurants.findOne(
                restaurantId
                );
        if(!restaurant) {
            return {
                ok: false,
                error: 'restaurant not found'
            };
        };
        if(owner.id ! === restaurant.ownerId) {
            return {
                ok: false,
                error: "you can't delete a restaurant that you don't own."
            };
        };
            
        await this.restaurants.delete(restaurantId)

        return {
            ok: true
        };

        } catch (error) {
            return {
                ok: false,
                error: 'could not delete restaurant'
            };
        }
    }

    async allCategories(): Promise<AllCategoriesOutPut> {
        try {
            const categories = await this.categories.find();
            return {
                ok: true,
                categories
            }
            
        } catch (error) {
            return {
                ok: false,
                error: 'could not load categories'
            };
        }
    }

    countRestaurants(category: Category) {
        return this.restaurants.count({category});
    };

    async findCategoryBySlug({slug, page}: CategoryInput): Promise<CategoryOutput> {
        try {
            const category = await this.categories.findOne(
                {slug},
                //{relations: ['restaurants']}/*이렇게 릴레이션을 연결하면 요청마다 load하는 문제가 있음. */
                //부분적으로 load한다
                );

            if(!category) {
                return {
                    ok: false,
                    error:'category not found'  
                };
            };
            const restaurants = await this.restaurants.find({
                where: {
                    category //위에서 선언한 category
                },
                take: 25,
                skip: (page - 1) *25
            });
            category.restaurants = restaurants;

            const totalResult = await this. countRestaurants(category)
            return {
                ok: true,
                category,
                totalPages: Math.ceil(totalResult /25)
            };
        } catch (error) {
            return {
                ok: false,
                error: 'could not load category'
            }
        }
    }
}