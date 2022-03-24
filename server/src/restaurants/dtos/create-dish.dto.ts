import { Field, InputType, ObjectType, PickType } from "@nestjs/graphql";
import { CoreOutput } from "src/common/dtos/output.dto";
import { Dish } from "../entities/dish.entity";

@InputType()
export class CreateDishInput extends PickType(Dish, [
    'name',
    'price',
    'description',
    'options'
]){
//dish에 이미 restaurantId이 있으나 field로 만들지 않았기 때문에 
//이렇게하면 스키마로 만들지 않고 restaurantId를 넣을 수 있다.
    @Field(type => Number)
    restaurantId: number
}

@ObjectType()
export class CreateDishOutput extends CoreOutput {
    
}

