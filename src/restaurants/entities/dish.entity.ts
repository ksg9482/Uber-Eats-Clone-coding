import { Field, InputType, ObjectType } from "@nestjs/graphql";
import { IsNumber, IsString, Length } from 'class-validator'
import { Column, Entity, ManyToOne, RelationId } from "typeorm";
import { CoreEntity } from "src/common/entities/core.entity";
import { Restaurant } from "./restaurant.entity";


@InputType('DishChoiceInputType', { isAbstract: true })
@ObjectType()
export class DishChoice {
    @Field(type => String)
    name:string;

    @Field(type => Number, {nullable: true})
    extra?: number;
};
//extra를 바꾸고 싶을 수 있기 때문


@InputType('DishOptionInputType', { isAbstract: true })
@ObjectType()
export class DishOption {
    @Field(type => String)
    name:string;

    @Field(type => [DishChoice], {nullable: true})
    choices?: DishChoice[];

    @Field(type => Number, {nullable: true})
    extra?: number;
};


@InputType('DishInputType',{isAbstract: true})
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
    price: number
    
    @Field(type => String, {nullable: true})
    @Column({nullable: true})
    @IsString()
    photo?: string

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

    @Field(type => [DishOption], {nullable: true})
    @Column({type:'json', nullable: true})//json 타입을 저장한다
    options?: DishOption[]

}