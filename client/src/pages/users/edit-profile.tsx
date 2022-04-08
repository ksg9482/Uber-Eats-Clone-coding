import { gql, useApolloClient, useMutation } from "@apollo/client";
import React from "react";
import { useForm } from "react-hook-form";
import { Button } from "../../components/button";
import { useMe } from "../../hooks/useMe";
import { editProfile, editProfileVariables } from "../../__generated__/editProfile";

const EDIT_PROFILE_MUTATION = gql`
    mutation editProfile($input: EditProfileInput!){
        editProfile(input: $input) {
            ok
            error
        }
    }
`;

interface IFormProps {
    email?: string;
    password?: string
}

export const EditProfile = () => {
    const { data: userData } = useMe();
    const client = useApolloClient();
    const onCompleted = (data:editProfile) => {
        const {
            editProfile: { ok }
        } = data;
        if(ok) {
            if(ok && userData) {
                const {
                    me: {email:prevEmail, id}
                } = userData;
                const {email: newEmail} = getValues();

                if(prevEmail !== newEmail) {
                    client.writeFragment({
                        id:`User:${id}`,
                        fragment: gql`
                            fragment EditedUser on User {
                                verified
                                email
                            }
                        `,
                        data: {
                            email: newEmail,
                            verified: false
                        }
                    });
                };
            }
// mutation을 cache에 업데이트 한다. 즉, api가 refresh하는 것을 기다리지 않는다
// 1.cache를 직접 update한다
// 2.query를 refetch한다. -> 이렇게 하면 cache를 업데이트 해준다[느림. 왜? 또다른 api call을 만드는 것과 같다. 즉시적용이 아님]
// hook인 userDate에서 이전 email과 id를 가져오고 form의 getValue를 써서 새로운 email을 가져온다
        }
    };

    const [editProfile, {loading}] = useMutation<
        editProfile, 
        editProfileVariables
        >(EDIT_PROFILE_MUTATION, {
        onCompleted
    });

    const {register, handleSubmit, getValues, formState: {isValid}} = useForm<IFormProps>({
        mode: 'onChange',
        defaultValues: {
            email: userData?.me.email
        }
    });

    const onSubmit = () => {
        const {email, password} = getValues();
        editProfile({
            variables: {
                input: {
                    email,
                    ...(password !== '' && {password})
                }
            }
        })
    };
    return (
        <div className="mt-52 flex flex-col justify-center items-center">
            <h4 className="font-semibold text-2xl mb-3">Edit Profile</h4>
            <form 
            onSubmit={handleSubmit(onSubmit)}
            className="grid max-w-screen-sm gap-3 mt-5 w-full mb-5"
            >
                <input 
                {...register('email', {
                    pattern: /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
                })}
                className="input" 
                type="email" 
                placeholder="Email" 
                />
                <input 
                {...register('password')}
                className="input" 
                type="password" 
                placeholder="Password" 
                />
                <Button 
                loading={loading} 
                canClick={isValid} 
                actionText="Save Profile" 
                />
            </form>
        </div>
    )
}