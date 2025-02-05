import { Inject, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { PubSub } from "graphql-subscriptions";
import { NEW_COOKED_ORDER, NEW_ORDER_UPDATE, NEW_PENDING_ORDER, PUB_SUB } from "src/common/common.constants";
import { Dish, DishOption } from "src/restaurants/entities/dish.entity";
import { Restaurant } from "src/restaurants/entities/restaurant.entity";
import { User, UserRole } from "src/users/entities/user.entity";
import { Repository } from "typeorm";
import { CreateOrderInput, CreateOrderOutput } from "./dtos/create-order.dto";
import { EditOrderInput, EditOrderOutput } from "./dtos/edit-order.dto";
import { GetOrderInput, GetOrderOutput } from "./dtos/get-order.dto";
import { GetOrdersInput, GetOrdersOutput } from "./dtos/get-orders.dto";
import { TakeOrderInput, TakeOrderOutput } from "./dtos/take-order.dto";
import { OrderItem } from "./entities/order-item.entity";
import { Order, OrderStatus } from "./entities/order.entity";

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
        private readonly dishes: Repository<Dish>,
        @Inject(PUB_SUB)
        private readonly pubSub: PubSub
    ) { }

    async createOrder(
        customer: User,
        { restaurantId, items }: CreateOrderInput
    ): Promise<CreateOrderOutput> {
        try {
            const restaurant = await this.restaurants.findOne(restaurantId);
            if (!restaurant) {
                return {
                    ok: false,
                    error: 'restaurant not found'
                }
            }

            let orderFinalPrice = 0;
            const orderItems: OrderItem[] = []

            //items.forEach(async item => {
            for (const item of items) {
                const dish = await this.dishes.findOne(item.dishId)
                if (!dish) {
                    return {
                        ok: false,
                        error: 'dish not found'
                        //타입스크립트의 보조가 작동하지 않음. 이거 중요
                        //이 return은 CoreOutput으로 안나옴
                        //resolver에서 return이 되지 않는 이유는 return이 forEach안에 있기 때문
                        //forEach에서는 return 할 수 없다. return해도 createOrder의 진행을 막을 수 없다
                        //그래서 forEach 대신에 for of를 사용한다.
                    };
                    // abort this whole thing
                }
                let dishFinalPrice = dish.price;
                //item.options -> OrderItemOption의 배열
                //dish.options -> DishOption의 배열
                for (const itemOption of item.options) {
                    //유저에게 받은 options을 찾아서 db에서 가져온 dish에서 해당되는 option을 찾는다
                    const dishOption = dish.options.find(
                        dishOption => dishOption.name === itemOption.name
                    );
                    //잘 보냈지만, 기본적으로 유저를 신뢰하지 않는다. 
                    //그렇기에 유저가 원하는 옵션들을 데이터베이스에서 찾는다
                    if (dishOption) {
                        if (dishOption.extra) {
                            dishFinalPrice = dishFinalPrice + dishOption.extra
                            //for 루프 안에 있기 때문에 각 dish에서 실행된다
                        }
                    } else {
                        const dishOptionChoice = dishOption.choices?.find(
                            optionChoice => optionChoice.name === itemOption.choice
                        );
                        if (dishOptionChoice) {
                            if (dishOptionChoice.extra) {
                            }
                        }
                    };
                    //만약 dish옵션에 extra가 없다면 dish 옵션의 choices를 봐야 한다
                    //choice에 사이즈가 들어가있고 거기에도 extra가 붙어있다
                    //extra가 있다면 dish price에 추가한다 -> 근데 for 루프안에 있네?
                    //각각 dish의 최종 가격을 계산해야 한다
                }
                //for루프의 계산이 끝나면 orderFinalPrice에 dishFinalPrice를 더한다
                orderFinalPrice = orderFinalPrice + dishFinalPrice

                const orderItem = await this.orderItem.save(
                    this.orderItem.create({
                        dish,
                        options: item.options
                    })

                );
                //CreateOrderInput안에 있는 OrderItemOption이랑 같은 것.
                orderItems.push(orderItem);
            };


            const order = await this.orders.save(
                this.orders.create({
                    customer,
                    restaurant,
                    total: orderFinalPrice,
                    items: orderItems
                    //주의: items는 many to many 관계!
                })
            );
                
            await this.pubSub.publish(NEW_PENDING_ORDER, {
                pendingOrders: { order, ownerId: restaurant.ownerId }
            });
            //payload는 resolver의 이름
            //이 order를 subscription으로 곧장 보내도 문제는 없었다
            //그러나 밑의 editOrder 쪽에선 아니다.

            return {
                ok: true,
                orderId:order.id
            }
        } catch (error) {
            return {
                ok: false,
                error: 'could not create order'
            }
        }
    };

    async getOrders(
        user: User,
        { status }: GetOrdersInput //filter역할
    ): Promise<GetOrdersOutput> {
        try {
            let orders: Order[];
            if (user.role === UserRole.Client) {
                orders = await this.orders.find({
                    where: {
                        customer: user,
                        ...(status && { status }) //object에 조건부로 property를 추가
                    }
                });
            } else if (user.role === UserRole.Delivery) {
                orders = await this.orders.find({
                    where: {
                        driver: user,
                        ...(status && { status })
                    }
                });
            } else if (user.role === UserRole.Owner) {
                //한 오너가 많은 레스토랑을 가질 수 있기에 따로 만들었음. 그거 고려할 것
                const restaurants = await this.restaurants.find({
                    where: {
                        owner: user
                    },
                    relations: ['orders']
                    //restaurant을 전부 load 하고 싶지 않고
                    //restaurant에 orders가 있기 때문
                    //owner가 user인 모든 음식점을 찾고 order를 select한다
                });
                orders = restaurants.map(restaurant => restaurant.orders).flat(1)
                //flat(1)을 하는 이유 -> restaurant.orders를 뽑고 있기 때문에 
                //order가 비어있으면 '빈배열'이 뽑혀서 들어간다.[[[order1],[order2]], [], []]
                //그래서 한 층 바깥으로 빼줘서 빈배열을 없앴다. [[order1],[order2]]
                //order를 원하는 것이지 order가 들어있는 array를 원하는게 아니다.
            } if (status) {
                orders = orders.filter(order => order.status === status)
            }
            return {
                ok: true,
                orders
            };
        } catch (error) {
            return {
                ok: false,
                error: 'could not get orders'
            }
        }
    };

    canSeeOrder(user: User, order: Order): Boolean {
        let canSee = true;
        if (user.role === UserRole.Client && order.customerId !== user.id) {
            canSee = false
        }
        if (user.role === UserRole.Delivery && order.driverId !== user.id) {
            canSee = false
        }
        if (
            user.role === UserRole.Owner &&
            order.restaurant.ownerId !== user.id
        ) {
            //문제는 3개의 relation을 load 해야 한다는 것
            //restaurant relation은 반드시 load해야 한다. order의 restaurant owner를 알아야 함
            //customer, driver는 load하지 않아도 된다. order entitiy에서 relation 컬럼을 만들면 된다
            canSee = false
        }
        return canSee
    }

    async getOrder(
        user: User,
        { id: orderId }: GetOrderInput //{id: orderId}처럼 써서 이름 재정의 가능
    ): Promise<GetOrderOutput> {
        try {
            const order = await this.orders.findOne(orderId,
                { relations: ['restaurant'] });
            if (!order) {
                return {
                    ok: false,
                    error: 'order not found'
                };
            }

            if (!this.canSeeOrder(user, order)) {
                return {
                    ok: false,
                    error: "you can't see that"
                };
            }
            return {
                ok: true,
                order
            }
        } catch (error) {
            return {
                ok: false,
                error: 'could not load order'
            }
        }

    };

    async editOrder(
        user: User,
        { id: orderId, status }: EditOrderInput
    ): Promise<EditOrderOutput> {
        try {
            const order = await this.orders.findOne(orderId);
            //eager relation은 db에서 entity를 load 할 때마다 자동으로 load되는 relation을 말한다
            //order entity에서 eager 활성화
            //단 eager relation을 쓸 때는 너무 많은 것을 load하면 안된다
            //graphql의 'n+1 problem'을 주의 할 것(연결해서 계속 부르기)


            if (!order) {
                return {
                    ok: false,
                    error: 'order not found'
                }
            }
            if (!this.canSeeOrder(user, order)) {
                return {
                    ok: false,
                    error: "can't see this"
                };
            }


            let canEdit = true
            if (user.role === UserRole.Client) {
                canEdit = false
            }

            if (user.role === UserRole.Owner) {
                if (status !== OrderStatus.Cooking && status !== OrderStatus.Cooked) {
                    canEdit = false
                }
            }
            if (user.role === UserRole.Delivery) {
                if (status !== OrderStatus.PickedUp && status !== OrderStatus.Delivered) {
                    canEdit = false
                }
            }

            if (!canEdit) {
                return {
                    ok: false,
                    error: "you can't do that"
                }
            }

            await this.orders.save(
                {
                    id: orderId,
                    status
                }
            )
            const newOrder = { ...order, status }
            if (user.role === UserRole.Owner) {
                if (status === OrderStatus.Cooked) {
                    await this.pubSub.publish(NEW_COOKED_ORDER, {
                        cookedOrder: newOrder
                    })// status가 cooking이기 때문에 cooked로 바꾸기 위함
                } //이건 driver에게만 감.
            }
            await this.pubSub.publish(NEW_ORDER_UPDATE, { //이건 모두에게 감
                orderUpdates: newOrder
            })
            //이미 존재하는 entity를 save하고 create하는 것의 차이
            //entity를 create할 때는 save method가 create된 entity를 return한다
            //entity를 save할 때는 entity 전체를 return하지 않는다
            //save method가 order 전체를 return하지 않기 때문에 원하는 정보를 못 받을 수 있다


            return {
                ok: true
            };
        } catch (error) {
            return {
                ok: false,
                error: 'could not edit order'
            }
        }
    }

    async takeOrder(
        driver: User,
        {id: orderId}: TakeOrderInput
        ):Promise<TakeOrderOutput> {
            try {
                const order = await this.orders.findOne(orderId);

            if(!order) {
                return {
                    ok: false,
                    error: 'order not found'
                };
            };
            if(order.driver) {
                return {
                    ok: false,
                    error: 'this order already has a driver'
                };
            };
            
            await this.orders.save({
                id: orderId,
                driver
            });
            await this.pubSub.publish(NEW_ORDER_UPDATE, {
                orderUpdates: { ...order, driver}
            });

            return { ok: true}

            } catch (error) {
                return {
                    ok: false,
                    error: 'could not update order'
                }
            }
    }

}