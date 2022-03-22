import { Field, InputType, ObjectType } from "@nestjs/graphql";
import { IsString, Length } from 'class-validator'
import { Column, Entity, ManyToMany, ManyToOne, OneToMany, RelationId } from "typeorm";
import { CoreEntity } from "src/common/entities/core.entity";
import { Category } from "./category.entity";
import { User } from "src/users/entities/user.entity";
@InputType('restaurantInputType',{isAbstract: true})//인풋타입을 써도 되긴 하는데 오브젝트타입, 인풋타입 두개 스키마가 같은 이름으로 생김 .오류.isAbstract: true은 복사해서 쓰겠다는 뜻. extend해서 쓰겠다 
@ObjectType() //graphql을 위한 것
@Entity() //typeorm을 위한 것
export class Restaurant extends CoreEntity {


    @Field(type => String)
    @Column()
    @IsString()
    @Length(1)
    name: string

    @Field(type => String)
    @Column()
    @IsString()
    coverImg: string

    @Field(type => String)
    @Column()
    @IsString()
    address: string

    @Field(type => Category, {nullable: true})
    @ManyToOne( //레스토랑은 하나의 카테고리를 갖는다
    type => Category,
    category => category.restaurants,
    {nullable: true, onDelete:'SET NULL'} //카테코리를 지울때 레스토랑이 지워지지 않기 위해
    )
    category: Category

    @Field(type => User, {nullable: true})
    @ManyToOne(
    type => User,
    user => user.restaurants,
    {onDelete:"CASCADE"}
    )
    owner: User

    @RelationId((restaurant: Restaurant) => restaurant.owner)
    ownerId: number
    /*아이디를 받아와야 하는데 loadRelationIds로 받는건 number로 온다
    그런데 owner는 타입이 User기 때문에 맞지 않는다. owner 타입을 User | number로 바꾸는 건 이상하다.
    따라서 RelationId 데코레이터를 사용한다.*/
}