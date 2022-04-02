import { Field, InputType, ObjectType, registerEnumType } from "@nestjs/graphql";
import { CoreEntity } from "src/common/entities/core.entity";
import { BeforeInsert, BeforeUpdate, Column, Entity, OneToMany } from "typeorm";
import * as bcrypt from "bcrypt"
import { InternalServerErrorException } from "@nestjs/common";
import { IsBoolean, IsEmail, IsEnum, IsString } from "class-validator";
import { Restaurant } from "src/restaurants/entities/restaurant.entity";
import { Order } from "src/orders/entities/order.entity";
import { Payment } from "src/payments/entites/payment.entity";

//type UserRole = 'client' | 'owner' | 'delivery';
export enum UserRole {
    Client = 'Client',
    Owner = 'Owner',
    Delivery = 'Delivery',
}

registerEnumType(UserRole, {name: 'UserRole'})

@InputType('userInputType',{isAbstract: true})
@ObjectType()
@Entity()
export class User extends CoreEntity{

    @Column({unique:true})
    @Field(type => String)
    @IsEmail()
    email: string;

    @Column({select:false}) //재해시를 막는 첫번째 방법. 패스워드가 나가지 않도록 한다. 즉, typeorm이 이 항목이 업데이트 되었다 보지 않도록 한다
    @Field(type => String)
    @IsString()
    password: string;

    @Column({type: 'enum', enum: UserRole})
    @Field(type => UserRole)
    @IsEnum(UserRole)
    role: UserRole;

    @Column({ default: false })
    @Field(type => Boolean)
    @IsBoolean()
    verified: boolean;

    @Field(type => [Restaurant])
    @OneToMany( //한명의 오너는 여러 레스토랑을 가질 수 있다
        type => Restaurant, 
        restaurant => restaurant.owner
        )
    restaurants: Restaurant[];

    @Field(type => [Order])
    @OneToMany( //한명의 유저는 여러 주문을 가질 수 있다
        type => Order, 
        order => order.customer
        )
    orders: Order[];

    @Field(type => [Order])
    @OneToMany( 
        type => Order, 
        order => order.driver
        )
    rides: Order[];

    @Field(type => [Payment])
    @OneToMany( 
        type => Payment, 
        payment => payment.user
        )
    payments: Payment[];
    

    @BeforeInsert()
    @BeforeUpdate()
    async hashPassword():Promise<void>{
        //재해시를 막는 두번째 방법. password가 있을때만 hash하도록
        if(this.password){
            try {
                this.password = await bcrypt.hash(this.password, 10)
            } catch (error) {
                console.log(error);
                throw new InternalServerErrorException()
            }
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