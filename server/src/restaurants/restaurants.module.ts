import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Dish } from './entities/dish.entity';
import { Restaurant } from './entities/restaurant.entity';
import { CategoryRepository } from './repositories/category.repository';
import { CategoryResolver, DishResolver, RestaurantsResolver } from './restaurants.resolver';
import { RestaurantsService } from './restaurants.service';

@Module({
    imports: [TypeOrmModule.forFeature([Restaurant, Dish, CategoryRepository])],
    //forFeature는 typeOrmModule이 특정 feature를 import할 수 있게 해준다
    providers:[RestaurantsResolver, CategoryResolver, DishResolver, RestaurantsService]
})
export class RestaurantsModule {}
