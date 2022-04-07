import { ApolloError, gql, useMutation } from "@apollo/client";
import React from "react";
import { Helmet } from "react-helmet-async";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../components/button";
import { FormError } from "../components/form-error";
import yuberLogo from "../images/logo.svg"
import { createAccountMutaion, createAccountMutaionVariables } from "../__generated__/createAccountMutaion";
import { UserRole } from "../__generated__/globalTypes";


const CREATEACCOUNT_MUTATION = gql`
    mutation createAccountMutaion($CreateAccountInput: CreateAccountInput!) {
        createAccount(input: $CreateAccountInput) {
        ok
        error
        }
    }
`;
//이렇게 하면 input과 output이 전부 dto로 부터 오게 된다
//백엔드에서 dto를 수정하게 되면 프론트엔드에서 이를 감지한다. 즉, 버그 가능성 최소화
//이 이름은 backend로 넘어가지 않는다. frontend에서만 사용
//$을 붙이면 변수라는 뜻. apollo는 이것을 변수라고 받아들인다


interface ICreateAccountForm {
    email:string;
    password: string;
    role: UserRole;
}

export const CreateAccount = () => {
    const { 
        register,
        getValues,
        watch,
        handleSubmit,
        formState: { errors, isValid }
    } = useForm<ICreateAccountForm>({
        mode:'onChange' ,
        defaultValues: {
          role: UserRole.Client
        }
    });
    const navigate = useNavigate();
    const onCompleted = (data: createAccountMutaion) => {
        const {
            createAccount: {ok}
        } = data;
        if(ok) {
            navigate('/', { replace: true });
        }
    }
    const [
        createAccountMutaion,
        {loading, data: createAccountMutaionResult}
    ] = useMutation<createAccountMutaion, createAccountMutaionVariables>(
        CREATEACCOUNT_MUTATION,{
            onCompleted
        }
    );
    //data는 mutation으로부터 되돌아 온다. loading은 mutation이 실행되고 있다는 뜻. error는 mutation이 error를 반환한다는 뜻
    const onSubmit = () => {
        if(!loading) {
            const {email, password, role} = getValues();
            createAccountMutaion({
                variables: {
                    CreateAccountInput: {email, password, role}
                }
            })
        }
    };
    return (
        <div className="h-screen flex items-center flex-col mt-10 lg:mt-28">
            <Helmet>
                <title>
                    Create Account | Yuber Eats
                </title>
            </Helmet>
            <div className="w-full max-w-screen-sm flex flex-col px-5 items-center">
                <img src={yuberLogo} className="w-52 mb-10" alt="Yuber Eats"/>
                <h4 className="w-full font-medium text-left text-3xl mb-5">Get Started</h4>
                <form 
                onSubmit={handleSubmit(onSubmit)}
                className="grid gap-3 mt-5 w-full mb-5"
                >
                    <input 
                        {...register('email', {
                            required: 'Email is required',
                            pattern:/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
                        })}
                        required
                        placeholder="Email"
                        type={'email'}
                        className="input"
                    />
                    {errors.email?.message && (
                        <FormError errorMessage = {errors.email?.message}/>
                    )}
                    {errors.email?.type === 'pattern' && (
                        <FormError errorMessage = {"Please enter a valid email"} />
                    )}
                    <input 
                        {...register('password', {
                            required:'Password is required',
                            minLength: 8
                        })}
                        required
                    placeholder="Password" 
                    type={'password'}
                    className="input"
                    />
                    {errors.password?.message && (
                        <FormError errorMessage = {errors.password?.message}/>
                    )}
                    {errors.password?.type === 'minLength' && (
                        <FormError errorMessage = 'Password must be more than 8 chars'/>
                    )}
                    <select 
                    {...register('role', {required: true})}
                    className='input'
                    >
                      {Object.keys(UserRole).map((role, index)=> (
                        <option key={index}>{role}</option>
                      ))}
                    </select>
                    <Button 
                    canClick={isValid}
                    loading={loading}
                    actionText={'Create Account'}
                    />
                    {createAccountMutaionResult?.createAccount.error && (
                        <FormError errorMessage = {createAccountMutaionResult.createAccount.error}/>
                    )}
                </form>
                <div>
                    Already have an account{" "}
                    <Link to="/" className="text-lime-600 hover:underline">
                        Log in now
                    </Link>
                </div>
            </div>
          </div>
            )
}