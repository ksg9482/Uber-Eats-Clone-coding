import { ArgsType, Field, InputType, ObjectType, OmitType, PickType } from "@nestjs/graphql";
import {IsBoolean, IsString, Length} from 'class-validator'
import { CoreOutput } from "src/common/dtos/output.dto";
import { Restaurant } from "../entities/restaurant.entity";
@InputType()//ArgsType은 각각을 각각 분리된 Args로 사용할 수 있게 해준다
export class CreateRestaurantInput extends PickType(
    Restaurant, [
        'name',
        'coverImg',
        'address'
    ])
    {
        @Field(type => String)
        categoryName: string
    }

@ObjectType()
export class CreateRestaurantOutput extends CoreOutput {
    @Field(type => Number)
    restaurantId?: number //fake하기 위해 id가 필요
}

    //restaurent에서 id를 제외한 모든 것을 받는다. *OmitType은 InputType에서만 작동한다
    //즉 parent type인 Restaurant(ObjectType)와 child type(InputType)이 서로 type이 다르면 두번째 요소로 InputType으로 받음을 명시가 방법중 하나
    
    
    


