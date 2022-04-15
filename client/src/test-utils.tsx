import React from "react";
import { render } from "@testing-library/react";
import { HelmetProvider } from "react-helmet-async";
import { BrowserRouter as Router } from "react-router-dom";

const AllTheProviders: React.FC = ({ children }) => {
    return (
        <HelmetProvider>
            <Router>
                {children}
            </Router>
        </HelmetProvider>
    );
};
//어떤 때는 ApolloProvider가 필요하지만 어떤 때는 MockApollo가 필요할 때가 있다
//그래서 ApolloProvider를 포함시키지 않고 따로 적용한다

const customRender = (ui:React.ReactElement, options?:any) => 
    render(ui, {wrapper:AllTheProviders, ...options});
;
//중괄호에 넣고 안넣고 무슨 차이가 있는가?

// re-export everything
export * from "@testing-library/react";

// override render method
export { customRender as render };