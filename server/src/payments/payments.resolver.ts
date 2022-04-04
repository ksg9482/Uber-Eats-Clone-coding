import { Args, Mutation, Query, Resolver } from "@nestjs/graphql";
import { AuthUser } from "src/auth/auth-user.decorator";
import { Role } from "src/auth/role.decorator";
import { User } from "src/users/entities/user.entity";
import { CreatePaymentInput, CreatePaymentOutput } from "./dtos/create-payment.dto";
import { GetPaymentsOutput } from "./dtos/get-payment.dto";
import { Payment } from "./entites/payment.entity";
import { PaymentsService } from "./payments.service";

@Resolver(of => Payment)
export class PaymentsResolver {

    constructor(
        private readonly paymentsService: PaymentsService
    ) {}

    @Mutation(retunrs => CreatePaymentOutput)
    @Role(['Owner'])
    createPayment(
        @AuthUser() owner: User,
        @Args('input') createPaymentInput: CreatePaymentInput
    ):Promise<CreatePaymentOutput>{
        return this.paymentsService.createPayment(owner, createPaymentInput)
    };

    @Query(returns => GetPaymentsOutput)
    @Role(['Owner'])
    getPayment(
        @AuthUser() user: User
    ):Promise<GetPaymentsOutput> {
        return this.paymentsService.getPayments(user)
    }

}