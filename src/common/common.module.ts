import { Global, Module } from '@nestjs/common';
import { PubSub } from 'graphql-subscriptions';
import { PUB_SUB } from './common.constants';

const pubsub = new PubSub();

@Global()
@Module({
providers: [
    {
        provide: PUB_SUB,
        useValue: pubsub
        //pubsub은 전 app에서 하나여야 한다. 다른데서 쓰려면 이렇게 글로벌로.
    }
],
exports: [PUB_SUB]
//pubsub은 데모용. 서버에 단일 인스턴스로 있고 
//여러개의 연결로 확장하지 않는 경우에만 작동한다
//Heroku나 AWS lightsail에 서버를 올리는 경우에 충분. 
//그러나 서버를 여러개 가지고 있는 경우 pubsub은 적절하지 않다.
//pubsub은 서버에서 작동하기 때문에 여러 서버에는 다른 별도의 PubSub 인스턴스가 필요.
//모든 서버가 동일한 PubSub 인스턴스로 통신 할 수 있는 것.
//한 서버가 트리거를 listening하는 서버가 되고, 다른 서버가 트리거에 publish라는 서버이면
//동일한 PubSub이 아닌 경우 작동하지 않는다.
//PubSub은 다른 분리된 서버에 저장하라 -> redis pubsub에서는 host, port를 제공한다
//cluster를 쓰면 많은 node를 사용 할 수 있다
})
export class CommonModule {}
