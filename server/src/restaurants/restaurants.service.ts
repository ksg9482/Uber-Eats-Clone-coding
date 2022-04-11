import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "src/users/entities/user.entity";
import { Like, Raw, Repository } from "typeorm";
import { AllCategoriesOutPut } from "./dtos/all-categories.dto";
import { CategoryInput, CategoryOutput } from "./dtos/category.dto";
import { CreateDishInput, CreateDishOutput } from "./dtos/create-dish.dto";
import { CreateRestaurantInput, CreateRestaurantOutput } from "./dtos/create-restaurant.dto";
import { DeleteDishInput, DeleteDishOutput } from "./dtos/delete-dish.dto";
import { DeleteRestaurantInput, DeleteRestaurantOutput } from "./dtos/delete-retaurant.dto";
import { EditDishInput, EditDishOutput } from "./dtos/edit-dish.dto";
import { EditRestaurantInput, EditRestaurantOutput } from "./dtos/edit-reastaurant.dto";
import { RestaurantInput, RestaurantOutput } from "./dtos/restaurant.dto";
import { RestaurantsInput, RestaurantsOutput } from "./dtos/restaurants.dto";
import { SearchRestaurantInput, SearchRestaurantOutput } from "./dtos/search-restaurant.dto";
import { Category } from "./entities/category.entity";
import { Dish } from "./entities/dish.entity";
import { Restaurant } from "./entities/restaurant.entity";
import { CategoryRepository } from "./repositories/category.repository";

@Injectable()
export class RestaurantsService {
    constructor(
        @InjectRepository(Restaurant)
        private readonly restaurants: Repository<Restaurant>,
        @InjectRepository(Dish)
        private readonly dishes: Repository<Dish>,
        private readonly categories: CategoryRepository//레포지토리를 따로 만들었으면 그걸로 해야 됨
    ) { };


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
                ok: false,
                error: "could not create restaurant"
            }
        }
    };

    async editRestaurant(
        owner: User,
        editRestaurantInput: EditRestaurantInput): Promise<EditRestaurantOutput> {
        try {
            const restaurant = await this.restaurants.findOne(
                editRestaurantInput.restaurantId
            )
            if (!restaurant) {
                return {
                    ok: false,
                    error: 'restaurant not found'
                };
            };
            if (owner.id! === restaurant.ownerId) {
                return {
                    ok: false,
                    error: "you can't edit a restaurant that you don't own."
                }
            }

            let category: Category = null;
            //editRestaurantInput를 categoryName없이 보내면 카테고리를 업데이트하고 싶지 않다는 뜻.
            if (editRestaurantInput.categoryName) {
                category = await this.categories.getOrCreate(
                    editRestaurantInput.categoryName
                );
            }
            await this.restaurants.save([
                {
                    id: editRestaurantInput.restaurantId,
                    ...editRestaurantInput,
                    ...(category && { category })
                    //카테고리가 있으면 (Category인)category를 object를 리턴한다. 
                    //...category만 쓰면 null로 업데이트 될수도 있음
                }
            ]);
            //ok
            return {
                ok: true
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
        { restaurantId }: DeleteRestaurantInput
    ): Promise<DeleteRestaurantOutput> {
        try {
            const restaurant = await this.restaurants.findOne(
                restaurantId
            );
            if (!restaurant) {
                return {
                    ok: false,
                    error: 'restaurant not found'
                };
            };
            if (owner.id! === restaurant.ownerId) {
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
    };

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
    };

    countRestaurants(category: Category) {
        return this.restaurants.count({ category });
    };

    async findCategoryBySlug({ slug, page }: CategoryInput): Promise<CategoryOutput> {
        try {
            const category = await this.categories.findOne(
                { slug },
                //{relations: ['restaurants']}/*이렇게 릴레이션을 연결하면 요청마다 load하는 문제가 있음. */
                //부분적으로 load한다
            );

            if (!category) {
                return {
                    ok: false,
                    error: 'category not found'
                };
            };
            const restaurants = await this.restaurants.find({
                where: {
                    category //위에서 선언한 category
                },
                take: 25,
                skip: (page - 1) * 25,
                order: {
                    isPromoted: 'DESC'
                }
            });
            category.restaurants = restaurants;

            const totalResults = await this.countRestaurants(category)
            return {
                ok: true,
                restaurants,
                category,
                totalPages: Math.ceil(totalResults / 25),
                totalResults
            };
        } catch (error) {
            return {
                ok: false,
                error: 'could not load category'
            }
        }
    };

    async allRestaurants(
        { page }: RestaurantsInput
    ): Promise<RestaurantsOutput> {
        try {
            const [restaurants, totalResults] = await this.restaurants.findAndCount({
                take: 3,
                skip: (page - 1) * 3,
                order: {
                    isPromoted: 'DESC'
                }
            });

            return {
                ok: true,
                results: restaurants,
                totalPages: Math.ceil(totalResults / 3),
                totalResults
            }
        } catch (error) {
            return {
                ok: false,
                error: 'could not load categories'
            }
        }
    };

    async findRestaurantById(
        { restaurantId }: RestaurantInput
    ): Promise<RestaurantOutput> {
        try {
            const restaurant = await this.restaurants.findOne(restaurantId, { relations: ['menu'] })
            //restaurant에 가서 세부사항을 볼 때 menu를 불러올 수 있다
            if (!restaurant) {
                return {
                    ok: false,
                    error: 'restaurant not found'
                }
            }
            return {
                ok: true,
                restaurant
            }
        } catch (error) {
            return {
                ok: false,
                error: 'could not find restaurant'
            }
        }
    };

    async searchRestaurantByName(
        { query, page }: SearchRestaurantInput
    ): Promise<SearchRestaurantOutput> {
        try {
            const [restaurants, totalResults] = await this.restaurants.findAndCount({
                where: {
                    name: Raw(name => `${name} ILIKE '${query}'`)
                }
                //LIKE는 다음에 나오는 value를 찾아준다(LIKE '200%' -> 200으로 시작하는 값을 찾는다, '%200% -> 200포함된 값)
                //ILIKE는 대소문자를 구분하지 않게 해준다
            })
            return {
                ok: true,
                restaurants,
                totalResults,
                totalPages: Math.ceil(totalResults / 25)
            }
        } catch (error) {
            return {
                ok: false,
                error: 'could not search for restaurants'
            }
        }
    };

    async createDish(
        owner: User,
        createDishInput: CreateDishInput
    ): Promise<CreateDishOutput> {

        try {
            const restaurant = await this.restaurants.findOne(createDishInput.restaurantId);
            if (!restaurant) {
                return {
                    ok: false,
                    error: 'restaurant not found'
                };
            };
            if (restaurant.ownerId !== owner.id) {
                return {
                    ok: false,
                    error: "you can't do that"
                };
            };

            const dish = await this.dishes.save(this.dishes.create({...CreateDishInput, restaurant}))
            return {
                ok: true
            }

        } catch (error) {
            return {
                ok: false,
                error: 'could not create dish'
            }
        }
    };

    async editDish(
        owner:User,
        editDishInput: EditDishInput //{***,***}식으로 가져오지 않은 이유: 값이 없는 걸 가져오려 하면 undefined가 값으로 생김. 그건 원하는 바가 아니기 때문
        ): Promise<EditDishOutput> {
            try {
                const dish = await this.dishes.findOne(
                    editDishInput.dishId, 
                    {relations: ['restaurant']}
                    );
                if(!dish) {
                    return {
                        ok: false,
                        error: 'dish not found'
                    };
                };
                if(dish.restaurant.ownerId !== owner.id) {
                    return {
                        ok:false,
                        error: "you can't do that"
                    }
                }
    
                await this.dishes.save([{
                    id:editDishInput.dishId,
                    ...editDishInput
                }])
    
                return {
                    ok:true
                };

            } catch (error) {
                return {
                    ok:false,
                    error: 'could not delete dish'
                }
            };
    };

    async deleteDish(
        owner:User,
    {dishId}: DeleteDishInput
        ): Promise<DeleteDishOutput> {
            try {
                const dish = await this.dishes.findOne(
                    dishId, 
                    {relations: ['restaurant']}
                    );
                if(!dish) {
                    return {
                        ok: false,
                        error: 'dish not found'
                    };
                };
                if(dish.restaurant.ownerId !== owner.id) {
                    return {
                        ok:false,
                        error: "you can't do that"
                    }
                }
    
                await this.dishes.delete(dishId);
    
                return {
                    ok:true
                };

            } catch (error) {
                return {
                    ok:false,
                    error: 'could not delete dish'
                }
            };

    };

}