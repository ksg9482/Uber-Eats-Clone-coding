import { Field, InputType, Int, ObjectType } from '@nestjs/graphql';
import { CoreEntity } from 'src/common/entities/core.entity';
import { Restaurant } from 'src/restaurants/entities/restaurant.entity';
import { User } from 'src/users/entities/user.entity';
import { Column, Entity, ManyToOne, RelationId } from 'typeorm';

@InputType('PaymentInputType', { isAbstract: true })
@ObjectType()
@Entity()
export class Payment extends CoreEntity {
  @Field(type => String)
  @Column()
  transactionId: string;

  @Field(type => User)
  @ManyToOne(
    type => User,
    user => user.payments,
  )
  user: User;

  @RelationId((payment: Payment) => payment.user)
  userId: number;

//user가 소유한 여러 음식점 중 홍보하고 싶은 곳을 선택해야 하기 때문
  @Field(type => Restaurant)
  @ManyToOne(type => Restaurant)
  restaurant: Restaurant;
  //반대편에 many to one이 없어도 만들 수 있다.
  //restaurant가 가지고 있는 poayment에 관심 없기에 안만듦
    //one to many는 many to one 없이 존재할 수 없다.
    //many to one 관계에만 집중하고 싶다면 관련 entity에 one to many없이 정의 할 수 있다

  @RelationId((payment: Payment) => payment.restaurant)
  @Field(type => Number)
  restaurantId: number;
}