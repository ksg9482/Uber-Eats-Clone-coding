import { Field, InputType, ObjectType } from "@nestjs/graphql";
import { IsString, Length } from 'class-validator'
import { Column, Entity, OneToMany } from "typeorm";
import { CoreEntity } from "src/common/entities/core.entity";
import { Restaurant } from "./restaurant.entity";

@InputType('categoryInputType',{isAbstract: true})//인풋타입을 써도 되긴 하는데 오브젝트타입, 인풋타입 두개 스키마가 같은 이름으로 생김 .오류.isAbstract: true은 복사해서 쓰겠다는 뜻. extend해서 쓰겠다 
@ObjectType() //graphql을 위한 것
@Entity() //typeorm을 위한 것
export class Category extends CoreEntity {


    @Field(type => String)
    @Column({unique:true})
    @IsString()
    @Length(1)
    name: string

    @Field(type => String, {nullable: true})
    @Column({nullable:true})
    @IsString()
    coverImg: string

    @Field(type => String)
    @Column({unique:true})
    @IsString()
    slug: string

    @Field(type => [Restaurant], {nullable: true})
    @OneToMany( //하나의 카테고리는 여러 레스토랑을 가질 수 있다
        type => Restaurant, 
        restaurant => restaurant.category)
    restaurants: Restaurant[]
}