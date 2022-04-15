import { Test } from "@nestjs/testing";
import got from 'got';
import * as FormData from 'form-data';

import { CONFIG_OPTIONS } from "src/common/common.constants";
import { MailService } from "./mail.service";

jest.mock('got');
jest.mock('form-data')

const TEST_DOMAIN = 'test-domain'

describe('MailService', () => {
    let service: MailService;

    beforeEach(async () => {
        const module = await Test.createTestingModule({
            providers: [
                MailService, {
                    provide:CONFIG_OPTIONS,
                    useValue: {
                        apiKey: 'test-apiKey',
                        domain: TEST_DOMAIN,
                        fromEmail: 'test-fromEmail'
                    }
                }
            ]
        }).compile()

        service = module.get<MailService>(MailService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined()
    })

    describe('sendVerificationEmail', () => {
        it('should call sendEmail', () => {
            const sendVerificationEmailArgs = {
                email: 'email',
                code: 'code'
            };
            jest.spyOn(service, 'sendEmail').mockImplementation(async () => true)
            //spyOn은 실제 함수를 mock으로 할 수 없을 때 사용. 
            //mockImplementation은 implementation들을 전부 mock한다는 뜻.
            service.sendVerificationEmail(
                sendVerificationEmailArgs.email,
                sendVerificationEmailArgs.code
            );
            expect(service.sendEmail).toHaveBeenCalledTimes(1);
            expect(service.sendEmail).toHaveBeenCalledWith(
                'Verify Your Email', 'youber-eats',
                [
                    { key: 'username', value: sendVerificationEmailArgs.email },
                    { key: 'code', value: sendVerificationEmailArgs.code }
                ]
            )
            //sendEmail이 이 이름을 가지고 불렸는지 체크한다
        })
    })

    describe('sendEmail', () => {
        it('sends email', async () => {
            const ok = await service.sendEmail('', '', []);
            const formSpy = jest.spyOn(FormData.prototype, "append");
            expect(formSpy).toHaveBeenCalled();
            expect(got.post).toHaveBeenCalledTimes(1);
            expect(got.post).toHaveBeenCalledWith(
                `https://api.mailgun.net/v3/${TEST_DOMAIN}/messages`, 
                expect.any(Object)
            );
            expect(ok).toEqual(true)
        });

        it('fails on error', async () => {
            jest.spyOn(got, 'post').mockImplementation(() => {
                throw new Error();
            });
            const ok = await service.sendEmail('', '', []);
            expect(ok).toEqual(false)
        });
        
    })
});