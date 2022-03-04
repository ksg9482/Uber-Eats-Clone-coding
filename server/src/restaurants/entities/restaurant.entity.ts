import { Field, InputType, ObjectType } from "@nestjs/graphql";
import { number } from "joi";
import {IsBoolean, IsOptional, IsString, Length} from 'class-validator'
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
@InputType({isAbstract: true})//인풋타입을 써도 되긴 하는데 오브젝트타입, 인풋타입 두개 스키마가 같은 이름으로 생김 .오류.isAbstract: true은 복사해서 쓰겠다는 뜻. extend해서 쓰겠다 
@ObjectType() //graphql을 위한 것
@Entity() //typeorm을 위한 것
export class Restaurant {

    @PrimaryGeneratedColumn()
    @Field(type => Number) //String도 가능
    id: number

    @Field(type => String)
    @Column()
    @IsString()
    name: string

    @Field(type => Boolean, {defaultValue: true}/*{nullable: true}로 하면 유무 신경안씀 */)
    @Column({default: true})
    @IsOptional()//해당 필드를 보내거나 보내지 않을 수 있다는 의미
    @IsBoolean()
    isVegan: boolean

    @Field(type => String)
    @Column()
    @IsString()
    address: string

    @Field(type => String)
    @Column()
    @IsString()
    ownersName: string

    @Field(type => String)
    @Column()
    @IsString()
    categoryName: string
}