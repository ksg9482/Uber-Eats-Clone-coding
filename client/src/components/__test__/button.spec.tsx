import { render } from "@testing-library/react";
import React from "react";
import { Button } from "../button";
describe("<Button />", () => {
    it('should render OK with props', () => {
        const {getByText} = render(
            <Button canClick={true} loading={false} actionText="test"/>
        );
        getByText('test')
    });

    it('should display loading', () => {
        const {getByText, container} = render(
            <Button canClick={false} loading={true} actionText="test"/>
        );
        getByText('Loading...')
        expect(container.firstChild).toHaveClass('pointer-events-none')
    })
})

//세부적인 implementation을 체크하는 방식이 아님. 세부적인 implementation은 react의 관점에서 component가 작동하는 방식이고 이걸 테스트하는 게 아니다
//testing-library/react는 유저의 관점에서 테스트 할 수 있게 해준다
//코드를 테스트하는 것이 아니라 output을 테스트한다. 유저의 관점에서 component를 테스트하는 것
//버튼의 코드를 테스트하는 것이 아닌데 코드를 테스트해야 하는 것으로 생각할 수 있다.
//coverage를 100% cover할 수 없을수도 있는데 
//그건 유저가 버튼에서 보게 될 output만 테스트하기 때문이고 implementation라인이라 못채우는 것일 뿐