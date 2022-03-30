import { Field, Float, InputType, ObjectType, registerEnumType } from "@nestjs/graphql";
import { Column, Entity, JoinTable, ManyToMany, ManyToOne, RelationId  } from "typeorm";
import { CoreEntity } from "src/common/entities/core.entity";
import { User } from "src/users/entities/user.entity";
import { Restaurant } from "src/restaurants/entities/restaurant.entity";
import { Dish } from "src/restaurants/entities/dish.entity";
import { OrderItem } from "./order-item.entity";
import { IsEnum, IsNumber } from "class-validator";


export enum OrderStatus {
    Pending = 'Pending',
    Cooking = 'Cooking',
    Cooked = 'Cooked',
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
        {onDelete:"SET NULL", nullable: true, eager: true}
        )
    customer?: User;
    //하나의 유저는 여러 주문을 갖는다

    @RelationId((order: Order) => order.customer)
    customerId: number;

    @Field(type => User, {nullable: true}) //주문을 했을때 바로 배달원이 매칭되지 않기 때문
    @ManyToOne(
        type => User,
        user => user.rides,
        {onDelete:"SET NULL", nullable: true, eager: true}
        )
    driver?: User;

    @RelationId((order: Order) => order.driver)
    driverId: number;

    //restaurantId는 필요 없지만 ownerId는 필요하기에 여기에 안만든 것.

    @Field(type => Restaurant,{nullable: true})
    @ManyToOne(
        type => Restaurant,
        //이부분은 반대관계에서 어떻게 되는지 알려주는 역할
        restaurant => restaurant.orders,
        {onDelete:"SET NULL", nullable: true, eager: true}
        )
    restaurant?: Restaurant;

    @Field(type => [OrderItem])
    @ManyToMany(type => OrderItem, {eager: true})
    @JoinTable()
    //JoinTable은 소유(owning)하고 있는 쪽의 relation에 추가한다
    //dish에서 이 dish가 어떤 order에 포함되는지 알수 없음
    //order에서는 어떤 고객이 어떤 dish를 선택했는지 알 수 있다
    items: OrderItem[];
    //order는 여러 dish를 가질 수 있고, dish도 여러 order를 가질 수 있다
    //many to many

    @Column({nullable: true})
    @Field(type => Float, {nullable: true})
    @IsNumber()
    total?: number;

    @Column({type:'enum', enum: OrderStatus, default:OrderStatus.Pending})
    @Field(type => OrderStatus)
    @IsEnum(OrderStatus)
    status: OrderStatus;
}