import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { GqlExecutionContext } from "@nestjs/graphql";
import { Observable } from "rxjs";
import { JwtService } from "src/jwt/jwt.service";
import { User } from "src/users/entities/user.entity";
import { UsersService } from "src/users/users.service";
import { AllowedRoles } from "./role.decorator";

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(
        private readonly reflector: Reflector,
        private readonly jwtService: JwtService,
        private readonly userService: UsersService
    ) { }
    async canActivate(context: ExecutionContext) {
        const roles = this.reflector.get<AllowedRoles>(
            'roles',
            context.getHandler()
        );

        if (!roles) { //resolver가 public이라 role이 안생김
            return true
        }
        //잊지 말아야 할것 -> guard는 true나 false를 리턴하는 것이 목적!
        const gqlContext = GqlExecutionContext.create(context).getContext();
        const token = gqlContext.token;

        if (token) {
            const decoded = this.jwtService.verify(token.toString())//toString()을 쓰는 이유-typescript는 어떤 헤더든 array가 될 수 있다고 본다

            if (typeof decoded === 'object' && decoded.hasOwnProperty('id')) {
                const { user } = await this.userService.findById(decoded['id']);

                if (!user) {
                    return false;
                }
                gqlContext['user'] = user
                //guard가 decorator보다 먼저 호출됨(guard -> user를 graphql context에 추가)
                //decorator가 호출되면 decorator가 graphql context 내부에서 user를 찾는다
                if (roles.includes('Any')) {
                    return true
                }
                return roles.includes(user.role);
            } 
        } else {
            return false
        }
        return false
        //누가 GqlExecution에 context를 제공하고 있는가? 
        //http웹사이트 req -> jws middleware[헤더에서 토큰 가져와 유저 찾음]-> 찾은 유저를 req에 넣는다
        //GraphQL context function이 req내부에서 유저를 가져와 context.user에 넣는다
        //jwt middleware를 app module에서 지웠으므로 GraphQLModule.forRoot 안에 있는 context가 guard에 context를 제공

        //connection은 소켓이 클라이언트와 서버간의 연결을 설정하려 할때 발생한다

    }
}