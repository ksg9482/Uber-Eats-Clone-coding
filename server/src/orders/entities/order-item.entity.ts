import { Field, Float, InputType, ObjectType, registerEnumType } from "@nestjs/graphql";
import { Column, Entity, JoinTable, ManyToMany, ManyToOne  } from "typeorm";
import { CoreEntity } from "src/common/entities/core.entity";
import { User } from "src/users/entities/user.entity";
import { Restaurant } from "src/restaurants/entities/restaurant.entity";
import { Dish, DishChoice, DishOption } from "src/restaurants/entities/dish.entity";

//OrderItemOption은 유저가 고른 한가지 선택만 갖게 된다
@InputType('OrderItemOptionInputType', { isAbstract: true })
@ObjectType()
export class OrderItemOption {
    @Field(type => String)
    name:string;

    @Field(type => String, {nullable: true})
    choice?: string;
    // @Field(type => DishChoice, {nullable: true})
    // choice?: DishChoice;
    
    // choices가 아닌 choice인 이유: 선택한 사이즈 하나가 들어오는 것
    // 프론트엔드에서 얻는것, 백엔드에서 계산해도 되는 것 구분을 잘해야 한다.
    // 예를들어 extra는 유저가 선택할 수 있는 방법이 있으면 안됨
    // 그렇기에 여기서는 extra를 가질 필요가 없다
    // @Field(type => Number, {nullable: true})
    // extra?: number;
};

@InputType('OrderItemInputType',{isAbstract: true})//인풋타입을 써도 되긴 하는데 오브젝트타입, 인풋타입 두개 스키마가 같은 이름으로 생김 .오류.isAbstract: true은 복사해서 쓰겠다는 뜻. extend해서 쓰겠다 
@ObjectType() //graphql을 위한 것
@Entity() //typeorm을 위한 것
export class OrderItem extends CoreEntity { 

    @ManyToOne(type => Dish, {
        nullable:true, 
        onDelete:'CASCADE'
    })
    dish?: Dish;

    @Field(type => [OrderItemOption], {nullable: true})
    @Column({type:'json', nullable: true})//json 타입을 저장한다
    options?: OrderItemOption[];
    //options는 entity가 아니라 json이다. json으로 한 이유? 모든 요청이 유효하게 하기 위해
    //entity로 만들어 놨는데 주인이 다음날 갑자기 옵션을 바꾸면? 
    //entity를 바꾸면 이전주문까지 영향을 받게 된다. options는 주문이 한번 완료될때까지 저장되는 것

    
}