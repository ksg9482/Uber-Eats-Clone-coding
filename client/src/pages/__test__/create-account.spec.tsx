import { ApolloProvider } from "@apollo/client";
import { createMockClient, MockApolloClient } from "mock-apollo-client";
import React from "react";
import { CreateAccount, CREATEACCOUNT_MUTATION } from "../create-account";
import { render, waitFor, RenderResult } from "../../test-utils";
import userEvent from "@testing-library/user-event";
import { UserRole } from "../../__generated__/globalTypes";

const mockPush = jest.fn();

jest.mock("react-router-dom", () => {
    //실제모듈을 사용해서 일부분만 mock하고 싶을때 requireActual을 이용한다.
    const realModule = jest.requireActual("react-router-dom");
    return {
        ...realModule,
        useNavigate: () => { //useHistory도 같다. react-router-dom의 useNavigate함수를 mock한다.
            return {
                push: mockPush,
            };
        }
    }
})

describe("<CreateAccount />", () => {
    let renderResult: RenderResult;
    let mockedClient: MockApolloClient;
    beforeEach(async () => {
        await waitFor(() => {
            mockedClient = createMockClient();
            renderResult = render(
                <ApolloProvider client={mockedClient}>
                    <CreateAccount />
                </ApolloProvider>
            );
        });
    });

    it("renders OK", async () => {
        await waitFor(() =>
            expect(document.title).toBe("Create Account | Yuber Eats")
        );
    });

    it("renders validation errors", async () => {
        const { getByRole, getByPlaceholderText } = renderResult;
        const email = getByPlaceholderText(/email/i);
        const button = getByRole("button");

        await waitFor(() => {
            userEvent.type(email, "wont@work");
        });

        let errorMessage = getByRole("alert");
        expect(errorMessage).toHaveTextContent(/please enter a valid email/i);

        await waitFor(() => {
            userEvent.clear(email); //작동하지 않는 이메일을 넣었기에 초기화
        });
        errorMessage = getByRole("alert");
        expect(errorMessage).toHaveTextContent(/email is required/i);

        await waitFor(() => {
            userEvent.type(email, "working@email.com");
            userEvent.click(button);
        });
        errorMessage = getByRole("alert");
        expect(errorMessage).toHaveTextContent(/password is required/i);
    });

    // it("submits mutation with form values", async () => {
    //     const { getByRole, getByPlaceholderText } = renderResult;
    //     const email = getByPlaceholderText(/email/i);
    //     const password = getByPlaceholderText(/password/i);
    //     const button = getByRole("button");
    //     const formData = {
    //       email: "working@mail.com",
    //       password: "12",
    //       role: UserRole.Client,
    //     };
    //     const mockedLoginMutationResponse = jest.fn().mockResolvedValue({
    //       data: {
    //         createAccount: {
    //           ok: true,
    //           error: "mutation-error",
    //         },
    //       },
    //     });
    //     mockedClient.setRequestHandler(
    //       CREATEACCOUNT_MUTATION,
    //       mockedLoginMutationResponse
    //     );
    //     jest.spyOn(window, "alert").mockImplementation(() => null);
    //      alert를 읽지 못하겠다는 오류 해결위함. spy로 실제작동 읽어옴
    //     await waitFor(() => {
    //       userEvent.type(email, formData.email);
    //       userEvent.type(password, formData.password);
    //       userEvent.click(button);
    //     });
    //     expect(mockedLoginMutationResponse).toHaveBeenCalledTimes(1);
    //     expect(mockedLoginMutationResponse).toHaveBeenCalledWith({
    //       createAccountInput: {
    //         email: formData.email,
    //         password: formData.password,
    //         role: formData.role,
    //       },
    //     });
    //     expect(window.alert).toHaveBeenCalledWith("Account Created! Log in now!");
    //     const mutationError = getByRole("alert");
    //     expect(mockPush).toHaveBeenCalledWith("/");
    //     expect(mutationError).toHaveTextContent("mutation-error");
    //   });
    it.todo('login과 똑같은 문제. mockresponse가 작동안함')

    afterAll(() => { //mock한 모듈을 되돌려 놓아서 비정상적인 작동을 방지한다
        jest.clearAllMocks();
    });
});
/*client 디렉토리와 user 디렉토리 Query 문제가 생긴다면 이 글을 참고해주세요.

query에 fragments가 추가되어 있는 부분은 가상 데이터에
"__typename"을 추가해야지만 jest에서 정상적인 데이터를 가져옵니다.

EX)
data: {
category: {
...(생략)
category: {
__typname: 'Category',
...(생략)
}
}
loading: false,
} */