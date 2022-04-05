import { gql, useMutation } from "@apollo/client";
import React from "react";
import { useForm } from "react-hook-form";
import { FormError } from "../components/form-error";

const LOGIN_MUTATION = gql`
    mutation LogInMutaion($email: string!, $password: string!) {
        login(input: { email: $email, password: $password}) {
        ok
        error
        token
        }
    }
`;
//이 이름은 backend로 넘어가지 않는다. frontend에서만 사용
//$을 붙이면 변수라는 뜻. apollo는 이것을 변수라고 받아들인다


interface ILoginForm {
    email:string;
    password: string;
}

export const Login = () => {
    const {register, getValues, handleSubmit, formState:{errors}} = useForm<ILoginForm>();
    const [loginMutaion, /*{data,loading,error}*/] = useMutation(LOGIN_MUTATION);
    //data는 mutation으로부터 되돌아 온다. loading은 mutation이 실행되고 있다는 뜻. error는 mutation이 error를 반환한다는 뜻
    const onSubmit = () => {
        const {email, password} = getValues();
        loginMutaion({
            variables: {
                email,
                password
            }
        });
    };
    return (
        <div className="h-screen flex items-center justify-center bg-gray-800">
            <div className="bg-white w-full max-w-lg pt-10 pb-7 rounded-lg text-center">
                <h3 className="text-2xl text-gray-800">Log In</h3>
                <form 
                onSubmit={handleSubmit(onSubmit)}
                className="grid gap-3 mt-5 px-5"
                >
                    <input 
                        {...register('email', {
                            required: 'Email is required'
                        })}
                        required
                        placeholder="Email"
                        className="input"
                    />
                    {errors.email?.message && (
                        <FormError errorMessage = {errors.email?.message}/>
                    )}
                    <input 
                        {...register('password', {
                            required:'Password is required',
                            minLength: 8
                        })}
                        required
                    placeholder="Password" 
                    className="input"
                    />
                    {errors.password?.message && (
                        <FormError errorMessage = {errors.password?.message}/>
                    )}
                    {errors.password?.type === 'minLength' && (
                        <FormError errorMessage = 'Password must be more than 8 chars'/>
                    )}
                    <button className="mt-3 btn">
                        Log In
                    </button>
                </form>
            </div>
          </div>
            )
}