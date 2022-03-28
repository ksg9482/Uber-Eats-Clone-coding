import { Injectable, NestMiddleware } from "@nestjs/common";
import { NextFunction, Request, Response } from "express";
import { UsersService } from "src/users/users.service";
import { JwtService } from "./jwt.service";

@Injectable() //이렇게 안하면 dependency injection을 하기 어렵다. Injectable로 안돼있으면 inject 할 수 없다
export class JwtMiddleware implements NestMiddleware {
    constructor(
        private readonly jwtService: JwtService, //JwtService는 module에 의해 export되니 찾을 수 있었다. jwt module이 JwtService를 export한다
        private readonly userService: UsersService//UsersService는 어디서 오는가? user module이 UserService를 가지고 있다. 드러나 export되고 있지 않다. 즉, exports에 추가해 주어야 한다.
    ) { }
    async use(req: Request, res: Response, next: NextFunction) {
        if ('X-JWT' in req.headers) {
           // console.log(req.headers["x-jwt"]);
            const token = req.headers["X-JWT"];
            try {
                const decoded = this.jwtService.verify(token.toString())//toString()을 쓰는 이유-typescript는 어떤 헤더든 array가 될 수 있다고 본다
                if (typeof decoded === 'object' && decoded.hasOwnProperty('id')) {
                    const {user} = await this.userService.findById(decoded['id']);
                    //console.log(user)
                    req['user'] = user; // request에 user를 추가한다
                }
            } catch (error) {
                
            }
        }
        next(); //middleware로 쓰니까 next를 해주어야 한다.
    }
}