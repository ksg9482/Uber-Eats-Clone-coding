import { ApolloError, gql, useMutation } from "@apollo/client";
import React from "react";
import { Helmet } from "react-helmet";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { Button } from "../components/button";
import { FormError } from "../components/form-error";
import yuberLogo from "../images/logo.svg"
import { logInMutaion, logInMutaionVariables } from "../__generated__/logInMutaion";


const LOGIN_MUTATION = gql`
    mutation logInMutaion($loginInput: LoginInput!) {
        login(input: $loginInput) {
        ok
        error
        token
        }
    }
`;
//이렇게 하면 input과 output이 전부 dto로 부터 오게 된다
//백엔드에서 dto를 수정하게 되면 프론트엔드에서 이를 감지한다. 즉, 버그 가능성 최소화
//이 이름은 backend로 넘어가지 않는다. frontend에서만 사용
//$을 붙이면 변수라는 뜻. apollo는 이것을 변수라고 받아들인다


interface ILoginForm {
    email:string;
    password: string;
}

export const Login = () => {
    const { 
        register,
        getValues,
        watch,
        handleSubmit,
        formState: { errors, isValid }
    } = useForm<ILoginForm>({
        mode:'onChange' 
        //mode에 따라서 valid체크를 한다. onChange는 변화가 있을 때마다 체크. 
        //onBlur도 사용할만 하다. 포커스 상태에서 벗어나면 체크
        //onSubmit은 submit이벤트가 일어나고 valid체크를 하니 늦다
    });
    const onCompleted = (data: logInMutaion) => {
        const {login: {
            ok,
            error,
            token
        }} = data;
        if(ok) {
            console.log(token)
        } else {
            if(error) {

            }
        }
    };
    const onError = (error: ApolloError) => {
        //주의: output에서의 error false는 graphql에겐 onCompleted다. graphql의 error가 아님
        //graphql에서의 error는 request가 유효하지 않거나 인증이 필요하거나 url이 잘못되었을 경우

    };
    const [loginMutaion, {data:loginMutationResult, loading} /*{data,loading,error}*/] = useMutation<logInMutaion, logInMutaionVariables>(
        //useMutation은 array를 반환한다 
        //[0]번째는 반드시 호출해줘야 하는 mutation function이고 
        //두번째 원소는 objectr고 온갖게 들어있다
        LOGIN_MUTATION , {
            onCompleted,
            //onError
        }
    //     ,{
    //     variables: {
    //         loginInput: {
    //             email: watch('email'),
    //             password: watch('password')
    //             //variables는 getValue로 부터 얻는다. 
    //             //getValue()를 호출하게 되면 그 순간의 value를 얻는다
    //             //이러면 주는 값을 실시간으로 반영할 수 있다
    //         }
    //     }
    // }
    );
    //data는 mutation으로부터 되돌아 온다. loading은 mutation이 실행되고 있다는 뜻. error는 mutation이 error를 반환한다는 뜻
    const onSubmit = () => {
        if(!loading){
            const {email, password} = getValues();
            loginMutaion({
                variables: {
                    loginInput: {
                        email,
                        password
                    }
                }
            });
        }
        //loginMutaion();
        //variables는 getValue로 부터 얻는다. 
        //getValue()를 호출하게 되면 그 순간의 value를 얻는데
        //watch로 입력되는 값을 실시간으로 저장하기에 loginMutaion()만 있어도 된다
    };
    return (
        <div className="h-screen flex items-center flex-col mt-10 lg:mt-28">
            <Helmet>
                <title>
                    Login | Yuber Eats
                </title>
            </Helmet>
            <div className="w-full max-w-screen-sm flex flex-col px-5 items-center">
                <img src={yuberLogo} className="w-52 mb-10" />
                <h4 className="w-full font-medium text-left text-3xl mb-5">Wellcome back</h4>
                <form 
                onSubmit={handleSubmit(onSubmit)}
                className="grid gap-3 mt-5 w-full mb-5"
                >
                    <input 
                        {...register('email', {
                            required: 'Email is required'
                        })}
                        required
                        placeholder="Email"
                        type={'email'}
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
                    type={'password'}
                    className="input"
                    />
                    {errors.password?.message && (
                        <FormError errorMessage = {errors.password?.message}/>
                    )}
                    {errors.password?.type === 'minLength' && (
                        <FormError errorMessage = 'Password must be more than 8 chars'/>
                    )}
                    <Button 
                    canClick={isValid}
                    loading={loading}
                    actionText={'Log in'}
                    ></Button>
                    {loginMutationResult?.login.error && <FormError errorMessage={loginMutationResult.login.error} />}
                </form>
                <div>
                    New to Yuber?{" "}
                    <Link to="/create-account" className="text-lime-600 hover:underline">
                        Create an Account
                    </Link>
                </div>
            </div>
          </div>
            )
}