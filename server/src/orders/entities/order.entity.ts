import { Field, Float, InputType, ObjectType, registerEnumType } from "@nestjs/graphql";
import { IsString, Length } from 'class-validator'
import { Column, Entity, JoinTable, ManyToMany, ManyToOne, OneToMany, RelationId } from "typeorm";
import { CoreEntity } from "src/common/entities/core.entity";
import { User } from "src/users/entities/user.entity";
import { Restaurant } from "src/restaurants/entities/restaurant.entity";
import { Dish } from "src/restaurants/entities/dish.entity";


export enum OrderStatus {
    Pending = 'Pending',
    Cooking = 'Cooking',
    PickedUp = 'PickedUp',
    Delivered = 'Delivered'
}

registerEnumType(OrderStatus, {name: 'OrderStatus'});

@InputType('OrderInputType',{isAbstract: true})//인풋타입을 써도 되긴 하는데 오브젝트타입, 인풋타입 두개 스키마가 같은 이름으로 생김 .오류.isAbstract: true은 복사해서 쓰겠다는 뜻. extend해서 쓰겠다 
@ObjectType() //graphql을 위한 것
@Entity() //typeorm을 위한 것
export class Order extends CoreEntity {

    @Field(type => User, {nullable: true})
    @ManyToOne(
        type => User,
        user => user.orders,
        {onDelete:"SET NULL", nullable: true}
        )
    customer?: User;
    //하나의 유저는 여러 주문을 갖는다

    @Field(type => User, {nullable: true}) //주문을 했을때 바로 배달원이 매칭되지 않기 때문
    @ManyToOne(
        type => User,
        user => user.rides,
        {onDelete:"SET NULL", nullable: true}
        )
    driver?: User;

    @Field(type => Restaurant)
    @ManyToOne(
        type => Restaurant,
        restaurant => restaurant.orders,
        {onDelete:"SET NULL", nullable: true}
        )
    restaurant: Restaurant;

    @Field(type => [Dish])
    @ManyToMany(type => Dish)
    @JoinTable()
    //JoinTable은 소유(owning)하고 있는 쪽의 relation에 추가한다
    //dish에서 이 dish가 어떤 order에 포함되는지 알수 없음
    //order에서는 어떤 고객이 어떤 dish를 선택했는지 알 수 있다
    dishes: Dish[];
    //order는 여러 dish를 가질 수 있고, dish도 여러 order를 가질 수 있다
    //many to many

    @Column({nullable: true})
    @Field(type => Float, {nullable: true})
    total?: number;

    @Column({type:'enum', enum: OrderStatus})
    @Field(type => OrderStatus)
    status: OrderStatus;
}