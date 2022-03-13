import { UseGuards } from "@nestjs/common";
import { Args, Context, Mutation, Query, Resolver } from "@nestjs/graphql";
import { AuthUser } from "src/auth/auth-user.decorator";
import { AuthGuard } from "src/auth/auth.guard";
import { CreateAccountInput, CreateAccountOutput } from "./dtos/create-account.dto";
import { EditProfileInput, EditProfileOutput } from "./dtos/edit-profile.dto";
import { LoginInput, LoginOutput } from "./dtos/login.dto";
import { UserProfileInput, UserProfileOutput } from "./dtos/user-profile.dto";
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
    @UseGuards(AuthGuard) 
    me(@AuthUser() authUser: User) {//AuthUser는 현재 로그인 한 사용자에 대한 정보를 준다
        console.log(authUser)
        return authUser;
    }

    @UseGuards(AuthGuard)
    @Query(returns => User)
    async userProfile(@Args() userProfileInput: UserProfileInput): Promise<UserProfileOutput> {
        try {
            const user = await this.usersService.findById(userProfileInput.userId)
            if(!user){
                throw Error() //에러가 발생하면 밑에 catch로 error를 보낼 수 있다
            }
            return {
                ok: true,//Boolean(user), ->user를 찾으면 true, 못찾으면 false
                user
            }
        } catch (error) {
            return {
                ok:false,
                error:"User Not Found"
            }
            
        }
    }

    @UseGuards(AuthGuard)
    @Mutation(returns => EditProfileOutput)
    async editProfile(@AuthUser() authUser: User, @Args('input') editProfileInput: EditProfileInput): Promise<EditProfileOutput> {
        try {
            await this.usersService.editProfile(authUser.id, editProfileInput)
            return {
                ok: true
            }
        } catch (error) {
            return {
                ok:false,
                error
            }
        }
    }

    
}