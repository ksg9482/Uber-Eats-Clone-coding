import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Dish } from "src/restaurants/entities/dish.entity";
import { Restaurant } from "src/restaurants/entities/restaurant.entity";
import { User } from "src/users/entities/user.entity";
import { Repository } from "typeorm";
import { CreateOrderInput, CreateOrderOutput } from "./dtos/create-order.dto";
import { OrderItem } from "./entities/order-item.entity";
import { Order } from "./entities/order.entity";

@Injectable()
export class OrdersService {
    constructor(
        @InjectRepository(Order)
        private readonly orders: Repository<Order>,
        @InjectRepository(OrderItem)
        private readonly orderItem: Repository<OrderItem>,
        @InjectRepository(Restaurant)
        private readonly restaurants: Repository<Restaurant>,
        @InjectRepository(Dish)
        private readonly dishes: Repository<Dish>
    ) {}

    async createOrder(
        customer: User,
        {restaurnatId, items}: CreateOrderInput
    ): Promise<CreateOrderOutput> {
        try {
            const restaurant = await this.restaurants.findOne(restaurnatId);
            if(!restaurant) {
                return {
                    ok:false,
                    error:'restaurant not found'
                }
            }

            items.forEach(async item => {
                const dish = await this.dishes.findOne(item.dishID)
                if(!dish) {
                    // abort this whole thing
                }
                await this.orderItem.save(this.orderItem.create({
                    dish,
                    options: item.options
                }))
                //CreateOrderInput안에 있는 OrderItemOption이랑 같은 것.
            })
            const order = await this.orders.save(this.orders.create({
                customer,
                restaurant
            }))
            return {
                ok:false
            }
        } catch (error) {
            return {
                ok:false,
                error:'error'
            }
        }
    }
}