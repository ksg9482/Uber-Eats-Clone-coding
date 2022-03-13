import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { CreateAccountInput, CreateAccountOutput } from "./dtos/create-account.dto";
import { LoginInput, LoginOutput } from "./dtos/login.dto";
import { User } from "./entities/user.entity";
import { JwtService } from "src/jwt/jwt.service";
import { EditProfileInput } from "./dtos/edit-profile.dto";
import { Verification } from "./entities/verification.entitiy";

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User) 
        private readonly users: Repository<User>,
        @InjectRepository(Verification)
        private readonly verifications: Repository<Verification>,
        private readonly jwtService: JwtService
    ) { }

    async createAccount({ email, password, role }: CreateAccountInput): Promise<CreateAccountOutput> {
        // 배열로 한 것 처럼 객체로도 비슷하게 만들 수 있음
        try {
            const exists = await this.users.findOne({ email }); //이미 존재(exist)함
            if (exists) {
                return { ok: false, error: 'There is a user with that email already' };
            }
            const user = await this.users.save(this.users.create({ email, password, role }))
            
            await this.verifications.save(this.verifications.create({
                code: "test", 
                user
            }))
            return { ok: true }
        } catch (error) {
            return { ok: false, error: "Couldn't create account" };
        }
        // create user & hash the password
    }

    async login({ email, password }: LoginInput): Promise<LoginOutput> {
        try {
            const user = await this.users.findOne({ email });
            if (!user) {
                return {
                    ok: false,
                    error: 'User noy found'
                }
            }
            const passwordCorrect = await user.checkPassword(password);
            if (!passwordCorrect) {
                return {
                    ok: false,
                    error: 'Wrong password'
                }
            }
            const token = this.jwtService.sign(user.id)
            return {
                ok: true,
                token
            }
        } catch (error) {
            return {
                ok: false,
                error
            }
        }
    }
    async findById(id: number): Promise<User> {
        return this.users.findOne({ id });
    }

    async editProfile(
        userId: number, { email, password }: EditProfileInput
    ): Promise<User> {
        const user = await this.users.findOne(userId)
        if (email) {
            user.email = email;
            user.verified = false;
            await this.verifications.save(this.verifications.create({ user }))
        }
        if (password) {
            user.password = password;
        }
        return this.users.save(user);
    }
    //end
}