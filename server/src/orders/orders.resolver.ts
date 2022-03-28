import { Args, Mutation, Query, Resolver, Subscription } from "@nestjs/graphql";
import { PubSub } from "graphql-subscriptions";
import { AuthUser } from "src/auth/auth-user.decorator";
import { Role } from "src/auth/role.decorator";
import { User } from "src/users/entities/user.entity";
import { CreateOrderInput, CreateOrderOutput } from "./dtos/create-order.dto";
import { EditOrderInput, EditOrderOutput } from "./dtos/edit-order.dto";
import { GetOrderInput, GetOrderOutput } from "./dtos/get-order.dto";
import { GetOrdersInput, GetOrdersOutput } from "./dtos/get-orders.dto";
import { Order } from "./entities/order.entity";
import { OrdersService } from "./orders.service";

const pubsub = new PubSub();

@Resolver(of => Order)
export class OrdersResolver {
    constructor(
        private readonly ordersService: OrdersService
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
    
//subscriptions은 resolvre에서 변경 사항이나 업데이트를 수신 할 수 있게 해준다
//subscriptions은 몇가지 규칙이 있는데 뭘 return하느냐에 따라 다르다

    @Mutation(returns => Boolean)
    orderSubscriptionReady() {
        pubsub.publish('orderSubscription', {readyOrderSubscription:'ready!'})
        //트리거 이름은 pubsub.publish()와 pubsub.asyncIterator()에서 같으면 된다
        return true
    }

    @Subscription(returns => String)
    readyOrderSubscription() {
        //string일 경우 Subscription decorator에서 return하는 것, 
        //즉 GraphQL에서 return하는 것은 String을 return하지 않는다.
        //대신 asyncIterator을 return한다
        //1.인스턴스 생성. PubSub. publish and subscribe. 이를 통해 app 내부에서 메시지를 교환 할 수 있다
        //PubSub engine인스턴스.
        return pubsub.asyncIterator('orderSubscription') //triggers - 우리가 기다리는 이벤트
        //WS web socket을 활성화 해야 한다. http서버, ws서버 돌아가야 한다.
        //mutation과 query는 http가 필요, subscription은 ws서버가 필요
        //app module에서 graphql module -> installSubscriptionHandlers: true작성. 
        //서버가 웹소켓 기능을 가지게 된다 
        //subscription을 연결하는 방법은 API와 다르니 주의. http route를 거치지 않고 web socket route를 거친다
        //웹소켓에는 request가 없다.(쿠키 보내고 받고 하는 과정도 없다. 연결되면 연결상태를 유지한다.)
        //request가 없기에 뭘 return할지 주의해야 한다.
    }
}