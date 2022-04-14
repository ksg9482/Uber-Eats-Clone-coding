import { ApolloProvider } from "@apollo/client";
import { render, RenderResult, waitFor } from "@testing-library/react";
import { createMockClient, MockApolloClient } from "mock-apollo-client";
import React from "react";
import { Login, LOGIN_MUTATION } from "../login";
import { HelmetProvider } from "react-helmet-async";
import { BrowserRouter as Router } from "react-router-dom";
import userEvent from "@testing-library/user-event";

describe("<Login />", () => {
    let renderResult: RenderResult;
    let mockedClient: MockApolloClient;
    //render에 접근하는 법: render를 가져와서 변수생성. render는 RenderResult Type을 return 한다.
    //boforeEach 밖에서 선언하는 이유? 안에서 하면 다른곳에선 이용할 수 없기에 밖에서 선언하고 variable을 공유한다
    beforeEach(async () => {
        //beforEach를 사용 -> 많은 테스트를 만들기 때문에 만들어 놓는다
        await waitFor(async () => {
            mockedClient = createMockClient()
            renderResult = render(
                <HelmetProvider>
                    <Router>
                        <ApolloProvider client={mockedClient}>
                            <Login />
                        </ApolloProvider>
                    </Router>
                </HelmetProvider>
            );
        })
    });

    it("should render OK", async () => {
        await waitFor(() => {
            expect(document.title).toBe("Login | Yuber Eats")
        });
    });

    it("displays email validation errors", async () => {
        const { getByPlaceholderText, debug, getByRole } = renderResult;
        const email = getByPlaceholderText(/email/i);
        //i -> insensetive 대소문자 구분 안함
        await waitFor(() => {
            userEvent.type(email, "this@wont");
            //type function ->implementation call인 change event를 직접 할 필요 없는게 장점
        });

        let errorMessage = getByRole("alert");
        expect(errorMessage).toHaveTextContent(/please enter a valid email/i)
        await waitFor(() => {
            userEvent.clear(email)
        });

        //errorMessage 다시 선언한 이유는 메시지를 다시 받기 위해
        errorMessage = getByRole("alert");
        expect(errorMessage).toHaveTextContent(/email is required/i);
    });

    it("display password required errors", async () => {
        const { getByPlaceholderText, debug, getByRole } = renderResult;
        const email = getByPlaceholderText(/email/i);
        const submitBtn = getByRole("button");
        await waitFor(() => {
          userEvent.type(email, "this@wont.com");
          userEvent.click(submitBtn);
        });
        const errorMessage = getByRole("alert");
        expect(errorMessage).toHaveTextContent(/password is required/i);
    });

    it("submits form and calls mutation", async () => {
        const { getByPlaceholderText, debug, getByRole } = renderResult;
        const email = getByPlaceholderText(/email/i);
        const password = getByPlaceholderText(/password/i);
        const submitBtn = getByRole("button");
        const formData = {
            email: "real@test.com",
            password: "123",
        };
        //데이터 형식 제대로 맞춰야 함
        const mockedMutationResponse = jest.fn().mockResolvedValue({
            data: {
                login: {
                    ok: true,
                    error: "mutation-error",//null -> 백엔드에서 일어날 리 없지만 테스트하기 위해
                    token: "XXX"
                },
            },
        });
        
        mockedClient.setRequestHandler(LOGIN_MUTATION, mockedMutationResponse);
        //모사할 쿼리문과 그에 따른 응답을 넣는다
        jest.spyOn(Storage.prototype, "setItem");//로컬스토리지를 확인하는 테스트
        await waitFor(() => {
            userEvent.type(email, formData.email);
            userEvent.type(password, formData.password);
            userEvent.click(submitBtn);
        });
        expect(mockedMutationResponse).toHaveBeenCalledTimes(1);
        expect(mockedMutationResponse).toHaveBeenCalledWith({
            loginInput: {
                email: formData.email,
                password: formData.password,
            }
        });

        let errorMessage = getByRole("alert");
        expect(errorMessage).toHaveTextContent(/mutation-error/i);
        expect(localStorage.setItem).toHaveBeenCalledWith("nuber-token", "XXX");

    });

});
//An update to Login inside a test was not wrapped in act(...)
//act안에 있지 않은 테스트가 update되었다 -> state가 변하는 update를 wait하지 않았기 때문
//Login은 잘 render 되었지만 state에 변화가 있었다는 뜻.
//waitFor 안에 넣어서 기다리게끔 해준다







