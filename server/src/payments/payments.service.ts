
import { Injectable } from "@nestjs/common";
import { Interval } from "@nestjs/schedule";
import { InjectRepository } from "@nestjs/typeorm";
import { Restaurant } from "src/restaurants/entities/restaurant.entity";
import { User } from "src/users/entities/user.entity";
import { LessThan, Repository } from "typeorm";
import { CreatePaymentInput, CreatePaymentOutput } from "./dtos/create-payment.dto";
import { GetPaymentsOutput } from "./dtos/get-payment.dto";
import { Payment } from "./entites/payment.entity";

@Injectable()
export class PaymentsService {
    constructor(
        @InjectRepository(Payment)
        private readonly payments: Repository<Payment>,
        @InjectRepository(Restaurant)
        private readonly restaurants: Repository<Restaurant>
    ) { }

    async createPayment(
        owner: User,
        { restaurantId, transactionId }: CreatePaymentInput
    ):
        Promise<CreatePaymentOutput> {
        try {
            const restaurant = await this.restaurants.findOne({id:restaurantId});

            if (!restaurant) {
                return {
                    ok: false,
                    error: 'restaurnat not found'
                };
            };
            if (restaurant.ownerId !== owner.id) {
                return {
                    ok: false,
                    error: 'you are not allowed to do this'
                }
            }
            await this.payments.save(this.payments.create({
                transactionId,
                user: owner,
                restaurant
            }))
            restaurant.isPromoted = true;

            const date = new Date()
            date.setDate(date.getDate() + 7)
            restaurant.promotedUntil = date;
            this.restaurants.save(restaurant)

            return {
                ok: true
            }

        } catch (error) {
            return {
                ok: false,
                error: 'could not create payment'
            }
        }
    };

    async getPayments(user: User):Promise<GetPaymentsOutput> {
        try {
            const payments = await this.payments.find({user: user});
        return {
            ok:true,
            payments
        }
        } catch (error) {
            return {
                ok:false,
                error:'could not load payments'
            }
        }
    };

    //@Interval(2000)
    async checkPromotedRestaurants() {
        const restaurant = await this.restaurants.find({
            isPromoted:true,
            promotedUntil: LessThan(new Date())
        });

        restaurant.forEach(async restaurant => {
            restaurant.isPromoted = false,
            restaurant.promotedUntil = null
            await this.restaurants.save(restaurant)
        })
    }
}

