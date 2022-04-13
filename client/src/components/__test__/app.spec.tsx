import React from "react";

import { render, waitFor } from "@testing-library/react";
import { App } from "../app";
import { isLoggedInVar } from "../../apollo";

jest.mock("../../routers/logged-out-router", () => {
    return {
        LoggedOutRouter: () => <span>logged-out</span>
    };
});
//app에 condition이 있기 때문 -> isLoggenIn이 있다.
//테스트에서 유저가 login을 안해서 false를 return한다
jest.mock("../../routers/logged-in-router", () => {
    return {
        LoggedInRouter: () => <span>logged-in</span>
    };
});
//test component를 만들때 component를 바꿔주는 interaction을 만드는게 좋다 
describe("<App />", () => {
    it("renders LoggedOutRouter", () => {
        const {getByText} = render(<App />)
        getByText('logged-out')
    });
    //waitFor()에서는 state를 바꾸는데 state가 refresh할 수 있도록 기다려 준다
    it("renders LoggedInRouter", async() => {
        const {getByText} = render(<App />)
        await waitFor(()=> {
            isLoggedInVar(true);
        })
        getByText('logged-in');
    });
    
});
