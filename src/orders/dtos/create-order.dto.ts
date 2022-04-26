import { Field, InputType, ObjectType, PickType } from "@nestjs/graphql";
import { CoreOutput } from "src/common/dtos/output.dto";
import { OrderItemOption } from "../entities/order-item.entity";

@InputType()
class CreateOrderItemInput {

    @Field(type => Number)
    dishId: number;

    @Field(type => [OrderItemOption], {nullable: true})
    options?: OrderItemOption[];
}

@InputType()
export class CreateOrderInput { //PickType을 쓰지 않는이유 -> OrderItem전체를 Input으로 하지 않기 위해

    @Field(type => Number)
    restaurantId: number;

    @Field(type => [CreateOrderItemInput])
    items: CreateOrderItemInput[];

}

@ObjectType()
export class CreateOrderOutput extends CoreOutput {
    @Field(type => Number, {nullable:true})
    orderId?: number;
}