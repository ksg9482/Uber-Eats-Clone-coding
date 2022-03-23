import { SetMetadata } from "@nestjs/common";
import { Args, Int, Mutation, Parent, Query, ResolveField, Resolver } from "@nestjs/graphql";
import { number } from "joi";
import { AuthUser } from "src/auth/auth-user.decorator";
import { Role } from "src/auth/role.decorator";
import { User } from "src/users/entities/user.entity";
import { AllCategoriesOutPut } from "./dtos/all-categories.dto";
import { CategoryInput, CategoryOutput } from "./dtos/category.dto";
import { CreateRestaurantInput, CreateRestaurantOutput } from "./dtos/create-restaurant.dto";
import { DeleteRestaurantInput, DeleteRestaurantOutput } from "./dtos/delete-retaurant.dto";
import { EditRestaurantInput, EditRestaurantOutput } from "./dtos/edit-reastaurant.dto";
import { RestaurantInput, RestaurantOutput } from "./dtos/restaurant.dto";
import { RestaurantsInput, RestaurantsOutput } from "./dtos/restaurants.dto";
import { SearchRestaurantInput, SearchRestaurantOutput } from "./dtos/search-restaurant.dto";
import { Category } from "./entities/category.entity";
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

    @Mutation(returns => EditRestaurantOutput)
    @Role(['Owner'])
    editRestaurant(
        @AuthUser() owner: User,
        @Args('input') editRestaurantInput: EditRestaurantInput
    ): Promise<EditRestaurantOutput> {
        return this.restaurantsService.editRestaurant(owner, editRestaurantInput);
    };

    @Mutation(returns => DeleteRestaurantOutput)
    @Role(['Owner'])
    deleterestaurant(
        @AuthUser() owner: User,
        @Args('input') deleteRestaurantInput: DeleteRestaurantInput
    ): Promise<DeleteRestaurantOutput> {
        return this.restaurantsService.deleteRestaurant(owner, deleteRestaurantInput)
    };

    @Query(returns => RestaurantsOutput)
    restaurants(
        @Args('input') restaurantsInput: RestaurantsInput
    ): Promise<RestaurantsOutput> {
        return this.restaurantsService.allRestaurants(restaurantsInput)
    };

    @Query(returns => RestaurantOutput)
    restaurant(
        @Args('input') restaurantInput: RestaurantInput
    ): Promise<RestaurantOutput> {
        return this.restaurantsService.findRestaurantById(restaurantInput)
    };

    @Query(returns => SearchRestaurantOutput)
    searchRestaurant(
        @Args('input') searchRestaurantinput: SearchRestaurantInput
    ):Promise<SearchRestaurantOutput> {
        return this.restaurantsService.searchRestaurantByName(searchRestaurantinput)
    }

}

@Resolver(of => Category)
export class CategoryResolver {
    constructor(private readonly restaurantsService: RestaurantsService) { }

    @ResolveField(type => Int)
    //매 request마다 계산된 field를 만들어 준다
    restaurantCount(@Parent() category: Category): Promise<number> {
        return this.restaurantsService.countRestaurants(category)
    }

    @Query(type => AllCategoriesOutPut)
    allCategories(): Promise<AllCategoriesOutPut> {
        return this.restaurantsService.allCategories();
    };

    @Query(type => CategoryOutput)
    category(@Args('input') categoryInput: CategoryInput): Promise<CategoryOutput> {
        return this.restaurantsService.findCategoryBySlug(categoryInput)
    }
}