import { CanActivate, ExecutionContext } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { GqlExecutionContext } from "@nestjs/graphql";
import { Observable } from "rxjs";
import { User } from "src/users/entities/user.entity";
import { AllowedRoles } from "./role.decorator";


export class AuthGuard implements CanActivate {
    constructor(private readonly reflector: Reflector) {}
    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
        const roles = this.reflector.get<AllowedRoles>(
            'roles', 
            context.getHandler()
            );
            if(!roles) { //resolver가 public이라 role이 안생김
                return true
            }
            //잊지 말아야 할것 -> guard는 true나 false를 리턴하는 것이 목적!
        const gqlContext = GqlExecutionContext.create(context).getContext();
        //console.log(gqlContext)
        const user:User = gqlContext['user'];
        if(!user) {
            return false;
        }
        if(roles.includes('Any'))
        return roles.includes(user.role);
    }
}