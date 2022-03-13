import { Field, InputType, ObjectType, registerEnumType } from "@nestjs/graphql";
import { CoreEntity } from "src/common/entities/core.entity";
import { BeforeInsert, BeforeUpdate, Column, Entity } from "typeorm";
import * as bcrypt from "bcrypt"
import { InternalServerErrorException } from "@nestjs/common";
import { IsEmail, IsEnum, IsString } from "class-validator";

//type UserRole = 'client' | 'owner' | 'delivery';
enum UserRole {
    Client,
    Owner,
    Delivery,
}

registerEnumType(UserRole, {name: 'UserRole'})

@InputType({isAbstract: true})
@ObjectType()
@Entity()
export class User extends CoreEntity{

    @Column()
    @Field(type => String)
    @IsEmail()
    email: string;

    @Column()
    @Field(type => String)
    @IsString()
    password: string;

    @Column({type: 'enum', enum: UserRole})
    @Field(type => UserRole)
    @IsEnum(UserRole)
    role: UserRole;

    @Column()
    @Field(type => Boolean)
    verified: boolean;

    @BeforeInsert()
    @BeforeUpdate()
    async hashPassword():Promise<void>{
        try {
            this.password = await bcrypt.hash(this.password, 10)
        } catch (error) {
            console.log(error);
            throw new InternalServerErrorException()
        }
    }

    async checkPassword(aPassword: string): Promise<boolean> {
        try {
            return bcrypt.compare(aPassword, this.password);
        } catch (error) {
            console.log(error);
            throw new InternalServerErrorException()
        }
    }
}