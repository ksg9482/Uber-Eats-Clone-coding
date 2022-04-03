import { Mutation, Resolver } from "@nestjs/graphql";
import { CreatePaymentOutput } from "./dtos/create-payment.dto";
import { Payment } from "./entites/payment.entity";
import { PaymentsService } from "./payments.service";

@Resolver(of => Payment)
export class PaymentsResolver {

    constructor(
        private readonly paymenstService: PaymentsService
    ) {}

    @Mutation(retunrs => CreatePaymentOutput)
    createPayment(){

    }
}