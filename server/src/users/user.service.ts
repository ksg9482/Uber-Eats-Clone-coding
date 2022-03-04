import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { CreateAccountInput } from "./dtos/create-account.dto";
import { User } from "./entities/user.entity";

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User) private readonly users: Repository<User>
    ) {}

    async createAccount({email, password, role}: CreateAccountInput):Promise<[boolean, string?]> {
        // 배열로 한 것 처럼 객체로도 비슷하게 만들 수 있음
        try {
            const exists = await this.users.findOne({email}); //이미 존재(exist)함
            if(exists) {
                return [false,'There is a user with that email already'];
            }
            await this.users.save(this.users.create({email, password, role}))
            return [true]
        } catch (error) {
            return [false,"Couldn't create account"];
        }
        // create user & hash the password
    }
}