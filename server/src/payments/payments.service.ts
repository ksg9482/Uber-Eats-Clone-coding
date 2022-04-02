
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Payment } from "./entites/payment.entity";

@Injectable()
export class PaymentsService {
    constructor(
        @InjectRepository(Payment)
        private readonly payments:Repository<Payment>
    ) {}
}

