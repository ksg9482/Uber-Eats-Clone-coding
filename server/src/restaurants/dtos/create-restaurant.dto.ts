import { ArgsType, Field, InputType } from "@nestjs/graphql";
import {IsBoolean, IsString, Length} from 'class-validator'
@ArgsType()//ArgsType은 각각을 각각 분리된 Args로 사용할 수 있게 해준다
export class createRestaurantDto {
    @Field(type => String) 
    @IsString()
    @Length(3, 10)
    name: string;

    @Field(type => Boolean) 
    @IsBoolean()
    isVegan: boolean;

    @Field(type => String) 
    @IsString()
    address: string;

    @Field(type => String)
    @IsString() 
    ownersName: string;
}

// @InputType() //InputType은 하나의 object
// export class createRestaurantDto {
//     @Field(type => String) 
//     name: string;

//     @Field(type => Boolean) 
//     isVegan: boolean;

//     @Field(type => String) 
//     address: string;
    
//     @Field(type => String) 
//     ownersName: string;
// }