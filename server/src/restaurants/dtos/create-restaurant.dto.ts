import { ArgsType, Field, InputType, OmitType } from "@nestjs/graphql";
import {IsBoolean, IsString, Length} from 'class-validator'
import { Restaurant } from "../entities/restaurant.entity";
@InputType()//ArgsType은 각각을 각각 분리된 Args로 사용할 수 있게 해준다
export class CreateRestaurantDto extends OmitType(
    Restaurant, 
    ["id"], 
    /*InputType*/)
    {}
    //restaurent에서 id를 제외한 모든 것을 받는다. *OmitType은 InputType에서만 작동한다
    //즉 parent type인 Restaurant(ObjectType)와 child type(InputType)이 서로 type이 다르면 두번째 요소로 InputType으로 받음을 명시가 방법중 하나
    
    
    
    
    
    
    
    
    
    
    
    
    // @Field(type => String) 
    // @IsString()
    // @Length(3, 10)
    // name: string;

    // @Field(type => Boolean) 
    // @IsBoolean()
    // isVegan: boolean;

    // @Field(type => String) 
    // @IsString()
    // address: string;

    // @Field(type => String)
    // @IsString() 
    // ownersName: string;

    // @Field(type => String)
    // @IsString() 
    // categoryName: string;


