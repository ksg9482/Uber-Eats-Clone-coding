import { Field, InputType, ObjectType, PickType } from "@nestjs/graphql";
import { CoreOutput } from "src/common/dtos/output.dto";
import { Order } from "../entities/order.entity";

@InputType()
export class GetOrderInput extends PickType(Order, ['id']){

}

@ObjectType()
export class GetOrderOutput extends CoreOutput{

    @Field(type => Order, {nullable:true}) //주문을 찾지 못헐 수도 있기 때문
    order?: Order;
}
