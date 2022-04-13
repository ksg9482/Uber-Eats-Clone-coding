import { MockedProvider } from "@apollo/client/testing";
import { BrowserRouter as Router } from "react-router-dom";
import { getByText, render, waitFor } from "@testing-library/react";
import React from "react";
import { ME_QUERY } from "../../hooks/useMe";
import { Header } from "../header";

describe("<Header />", () => {
    it("renders varify banner", async () => {
        await waitFor(async () => {
            const { getByText } = render(<MockedProvider
                mocks={[
                    {
                        request: {
                            query: ME_QUERY
                        },
                        result: {
                            data: {
                                me: {
                                    id: 1,
                                    email: "",
                                    role: "",
                                    varified: false
                                }
                            }
                        }
                    }
                ]}
            >
                <Router>
                    <Header />
                </Router>
            </MockedProvider>)
            await new Promise((resolve) => setTimeout(resolve, 0));
            getByText('Please verify your email')
        });
    });

    it("renders without verify banner", async () => {
        await waitFor(async () => {
            const { queryByText } = render(
                <MockedProvider
                    mocks={[
                        {
                            request: {
                                query: ME_QUERY,
                            },
                            result: {
                                data: {
                                    me: {
                                        id: 1,
                                        email: "",
                                        role: "",
                                        verified: true,
                                    },
                                },
                            },
                        },
                    ]}
                >
                    <Router>
                        <Header />
                    </Router>
                </MockedProvider>
            );
            await new Promise((resolve) => setTimeout(resolve, 0));
            expect(queryByText("Please verify your email.")).toBeNull();
        })
    })
})

//component안에서 뭔가를 mock하면 안된다
//hook자체를 mock하면 안되고 hook에 결과를 주는 걸 mock해야 한다
//예를 들어: useMe response를 mock하는 것이 아니라 서버에 보내는 graphql request를 mock한다
//즉, hook이 아니라 request를 mock한다

//waitFor state를 업데이트 했기 때문에 그것도 기다려 줘야 함

//component에 특정 element가 없음을, 특정 text가 없음을 확인하고 싶다.
//query를 사용한다. query는 실패하지 않고 null을 return한다.