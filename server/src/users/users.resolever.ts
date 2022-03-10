import { UseGuards } from "@nestjs/common";
import { Args, Context, Mutation, Query, Resolver } from "@nestjs/graphql";
import { AuthUser } from "src/auth/auth-user.decorator";
import { AuthGuard } from "src/auth/auth.guard";
import { CreateAccountInput, CreateAccountOutput } from "./dtos/create-account.dto";
import { LoginInput, LoginOutput } from "./dtos/login.dto";
import { User } from "./entities/user.entity";
import { UsersService } from "./user.service";

@Resolver(of => User)
export class UsersResolver {
    constructor(private readonly usersService: UsersService) {}

    @Mutation(returns => CreateAccountOutput)
    async createAccount(@Args('input') createAccountInput: CreateAccountInput): Promise<CreateAccountOutput> {
        try {
           return this.usersService.createAccount(createAccountInput);
        
        } catch (error) {
            return {
                error: error,
                ok: false
            };
        }
    }

    @Mutation(returns => LoginOutput)
    async login(@Args('input') loginInput: LoginInput): Promise<LoginOutput>{
        try {
            return this.usersService.login(loginInput);
        } catch (error) {
            return {
                ok:false,
                error
            }
        } 
    }

    @Query(returns => User)
    @UseGuards(AuthGuard) //UseGuards와 AuthUser의 내용물을 같은 사실상 기능을 수행한다. UseGuards를 쓰냐, 데코레이터를 쓰냐의 차이
    me(@AuthUser() authUser: User) {
        console.log(authUser)
        return authUser;
    }
    
}