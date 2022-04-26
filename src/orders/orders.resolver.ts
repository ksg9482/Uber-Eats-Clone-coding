import { Inject } from "@nestjs/common";
import { Args, Mutation, Query, Resolver, Subscription } from "@nestjs/graphql";
import { PubSub } from "graphql-subscriptions";
import { AuthUser } from "src/auth/auth-user.decorator";
import { Role } from "src/auth/role.decorator";
import { NEW_COOKED_ORDER, NEW_ORDER_UPDATE, NEW_PENDING_ORDER, PUB_SUB } from "src/common/common.constants";
import { User } from "src/users/entities/user.entity";
import { CreateOrderInput, CreateOrderOutput } from "./dtos/create-order.dto";
import { EditOrderInput, EditOrderOutput } from "./dtos/edit-order.dto";
import { GetOrderInput, GetOrderOutput } from "./dtos/get-order.dto";
import { GetOrdersInput, GetOrdersOutput } from "./dtos/get-orders.dto";
import { OrderUpdatesInput } from "./dtos/order-updates.dto";
import { TakeOrderInput, TakeOrderOutput } from "./dtos/take-order.dto";
import { Order } from "./entities/order.entity";
import { OrdersService } from "./orders.service";


@Resolver(of => Order)
export class OrdersResolver {
    constructor(
        private readonly ordersService: OrdersService,
        @Inject(PUB_SUB) private readonly pubSub: PubSub //글로벌로 빼논걸 Inject해서 사용
    ){}

    @Mutation(returns => CreateOrderOutput)
    @Role(["Client"])
    async createOrder(
        @AuthUser() customer: User, 
        @Args('input') createOrderInput: CreateOrderInput
    ): Promise<CreateOrderOutput> {
        return this.ordersService.createOrder(customer, createOrderInput)
    }

    @Query(returns => GetOrdersOutput)
    @Role(['Any'])
    async getOrders(
        @AuthUser() user: User,
        @Args('input') getOrdersInput: GetOrdersInput
    ): Promise<GetOrdersOutput> {
    //누가 요청했는지도 알아야 한다. 예를들어 배달원과 주인이 원하는 order목록은 다르다
        return this.ordersService.getOrders(user, getOrdersInput)
    }

    @Query(returns => GetOrderOutput)
    @Role(['Any'])
    async getOrder(
        @AuthUser() user: User,
        @Args('input') getOrderInput: GetOrderInput
    ): Promise<GetOrdersOutput> {
    //누가 요청했는지도 알아야 한다. 예를들어 배달원과 주인이 원하는 order목록은 다르다
        return this.ordersService.getOrder(user, getOrderInput)
    }

    @Mutation(returns => EditOrderOutput)
    @Role(['Any'])
    async editOrder(
        @AuthUser() user: User,
        @Args('input') editOrderInput: EditOrderInput
    ): Promise<EditOrderOutput> {
        return this.ordersService.editOrder(user, editOrderInput)
    }
    
    @Subscription(returns => Order, {
        filter: ({pendingOrders: {ownerId}}, _, {user}) => {
            console.log(ownerId, user.id)
            return ownerId === user.id //true라면 이 subscription을 listening하고 있는 유저가 order를 보게된다
        },
        resolve: ({pendingOrders: {order}}) => order
        //pendingOrdersrk order그 자체가 아니기 때문에 바꿔줘야함
        //publish()의 payload를 바꿨기 때문에 resolve의 payload도 바꿔야함
    })
    @Role(['Owner'])
    pendingOrders() {
        return this.pubSub.asyncIterator(NEW_PENDING_ORDER)
    };

    @Subscription(returns => Order)
    @Role(['Delivery'])
    cookedOrder() {
        return this.pubSub.asyncIterator(NEW_COOKED_ORDER)
    };

    @Subscription(returns => Order, {
        filter: (
            {orderUpdates: order}: {orderUpdates: Order},
            {input}: {input: OrderUpdatesInput},
            {user}: {user: User}
        ) => {
            if (
                order.driverId !== user.id &&
                order.customerId !== user.id &&
                order.restaurant.ownerId !== user.id
                //order가 eager relatios과 같이 load되기 때문에 restaurant.ownerId를 쓸 수 있다
            ) {
                return false
            }
            return order.id === input.id
        }
    })
    @Role(['Any'])
    orderUpdates(
        @Args('input') orderUpdatesInput: OrderUpdatesInput
    ) {
        return this.pubSub.asyncIterator(NEW_ORDER_UPDATE)
    };

    @Mutation(returns => TakeOrderOutput)
    @Role(['Delivery'])
    takeOrder(
        @AuthUser() driver: User,
        @Args('input') takeOrderInput: TakeOrderInput
    ):Promise<TakeOrderOutput> {
        return this.ordersService.takeOrder(driver, takeOrderInput)
    };
    
// //subscriptions은 resolvre에서 변경 사항이나 업데이트를 수신 할 수 있게 해준다
// //subscriptions은 몇가지 규칙이 있는데 뭘 return하느냐에 따라 다르다

//     @Mutation(returns => Boolean)
//     async orderSubscriptionReady(@Args('orderId') orderId: number) {
//         await this.pubSub.publish('orderSubsc', {
//             readyOrderSubscription: orderId
//         })
//         //트리거 이름은 pubsub.publish()와 pubsub.asyncIterator()에서 같으면 된다
//         return true
//     }
//     //이 mutation은 db를 거치지 않는다! db에 저장하지 않고 pubsub에 push할 수 있다는 뜻

//     @Subscription(returns => String, {
//         filter: ({readyOrderSubscription},{orderId}/*payload, variables, context*/) => {
//             //filter의 variable은 listening을 시작하기 전에 subscription에 준 variables를 가진 object
//             //context의 user는 guard에 의해 추가된 것.
//             return readyOrderSubscription === orderId;
//         },
//         resolve: ({readyOrderSubscription}) => `your id ${readyOrderSubscription} is ready`
//         //resolve는 사용자가 받는 update 알림의 형태를 바꿔준다
//         //예를 들어 order를 update하면 order내용 전체가 아닌 바꿘 부분만 보내는 식으로 사용
//     })

//     @Role(['Any'])
//     readyOrderSubscription(
//         @Args('orderId') orderId: number,
//         @AuthUser() user: User
//     ) {
//         //string일 경우 Subscription decorator에서 return하는 것, 
//         //즉 GraphQL에서 return하는 것은 String을 return하지 않는다.
//         //대신 asyncIterator을 return한다
//         //1.인스턴스 생성. PubSub. publish and subscribe. 이를 통해 app 내부에서 메시지를 교환 할 수 있다
//         //PubSub engine인스턴스.
//         console.log(user);
//         return this.pubSub.asyncIterator('orderSubsc') //triggers - 우리가 기다리는 이벤트
//         //WS web socket을 활성화 해야 한다. http서버, ws서버 돌아가야 한다.
//         //mutation과 query는 http가 필요, subscription은 ws서버가 필요
//         //app module에서 graphql module -> installSubscriptionHandlers: true작성. 
//         //서버가 웹소켓 기능을 가지게 된다 
//         //subscription을 연결하는 방법은 API와 다르니 주의. http route를 거치지 않고 web socket route를 거친다
//         //웹소켓에는 request가 없다.(쿠키 보내고 받고 하는 과정도 없다. 연결되면 연결상태를 유지한다.)
//         //request가 없기에 뭘 return할지 주의해야 한다.
//         //ws에는 http header가 없다. 이 앱은 인증을 jwt middleware에 의해 처리하는데 jwt middleware는 req, res, next를 처리한다
//         //그러나 ws관한 일은 처리하지 않기에 token발급도 안된다 
//     }
}