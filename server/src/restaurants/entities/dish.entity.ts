import { Field, InputType, ObjectType } from "@nestjs/graphql";
import { IsNumber, IsString, Length } from 'class-validator'
import { Column, Entity, ManyToOne, RelationId } from "typeorm";
import { CoreEntity } from "src/common/entities/core.entity";
import { Restaurant } from "./restaurant.entity";

@InputType('categoryInputType',{isAbstract: true})//인풋타입을 써도 되긴 하는데 오브젝트타입, 인풋타입 두개 스키마가 같은 이름으로 생김 .오류.isAbstract: true은 복사해서 쓰겠다는 뜻. extend해서 쓰겠다 
@ObjectType() //graphql을 위한 것
@Entity() //typeorm을 위한 것
export class Dish extends CoreEntity {

    @Field(type => String)
    @Column({unique:true})
    @IsString()
    @Length(1)
    name: string
    
    @Field(type => Number)
    @Column()
    @IsNumber()
    price: string
    
    @Field(type => String)
    @Column()
    @IsString()
    photo: string

    @Field(type => String)
    @Column()
    @Length(5, 140)
    @IsString()
    description: string

    @Field(type => Restaurant)
    @ManyToOne(
    type => Restaurant,
    restaurant => restaurant.menu,
    {onDelete:"CASCADE"}
    )
    restaurant: Restaurant

    @RelationId((dish: Dish) => dish.restaurant)
    restaurantId: number

}