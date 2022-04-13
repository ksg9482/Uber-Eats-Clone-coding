import { render } from "@testing-library/react";
import React from "react";
import { BrowserRouter as Router } from "react-router-dom";
import { Restaurant } from "../restaurant";

describe("<Restaurant />", () => {
    it("render OK with props", () => {
        const restaurantProps = {
            id: 1,
            name: 'testName',
            coverImg: 'a',
            categoryName: 'testCategory'
        }
        const { getByText, container } = render(
            <Router>
                <Restaurant {...restaurantProps} />
            </Router>
        );
        getByText(restaurantProps.name);
        getByText(restaurantProps.categoryName);
        expect(container.firstChild).toHaveAttribute(
            "href",
            `/restaurants/${restaurantProps.id}`
        );
    })
})