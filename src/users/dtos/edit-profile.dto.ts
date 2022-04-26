import { InputType, ObjectType, PartialType, PickType } from "@nestjs/graphql";
import { CoreOutput } from "src/common/dtos/output.dto";
import { User } from "../entities/user.entity";

@InputType()
export class EditProfileInput extends PartialType(
    PickType(User, [
        'email',
        'password'
    ] //user에서 email, password를 가지고 class를 만들고 PartialType을 이용해서 optional하게 만든다
    )) { }


@ObjectType()
export class EditProfileOutput extends CoreOutput { }