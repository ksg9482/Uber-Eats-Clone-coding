import { Module } from '@nestjs/common';
import {ApolloDriver, ApolloDriverConfig} from '@nestjs/apollo';
import { GraphQLModule } from '@nestjs/graphql';
import { join } from 'path/posix';
import { RestaurantsModule } from './restaurants/restaurants.module';

@Module({
  imports: [GraphQLModule.forRoot<ApolloDriverConfig>({//nestjs에 graphql을 적용함
    driver: ApolloDriver,
    autoSchemaFile: true
  }), RestaurantsModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
