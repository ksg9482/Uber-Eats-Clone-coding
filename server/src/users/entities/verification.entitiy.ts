import { Field, InputType, ObjectType } from "@nestjs/graphql";
import { v4 as uuidv4 } from "uuid";
import { CoreEntity } from "src/common/entities/core.entity";
import { BeforeInsert, Column, Entity, JoinColumn, OneToOne } from "typeorm";
import { User } from "./user.entity";

@InputType({ isAbstract: true})
@ObjectType()
@Entity()
export class Verification extends CoreEntity {

    @Column()
    @Field(type => String)
    code: string

    @OneToOne(type => User, {onDelete:"CASCADE"})//삭제되었을 때. 붙어있는 것도 같이 삭제
    @JoinColumn()
    user: User

    @BeforeInsert()
    createCode(): void {
        this.code = uuidv4;
    }

}