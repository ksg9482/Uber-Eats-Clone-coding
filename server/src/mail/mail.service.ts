import { Inject, Injectable } from '@nestjs/common';
import { CONFIG_OPTIONS } from 'src/common/common.constants';
import { EmailVar, MailModuleOptions } from './mail.interfaces';
import got from 'got';
import * as FormData from 'form-data';

@Injectable()
export class MailService {
    constructor(
        @Inject(CONFIG_OPTIONS)
        private readonly options: MailModuleOptions
    ) {
        //this.sendEmail('testing', 'test');
    }

    async sendEmail(
        subject: string, 
        //to: string, 
        template: string,
        emailVars: EmailVar[]
        ): Promise<boolean> {
        const form = new FormData();
        form.append(
            'from',
            `From Yuber Eats <mailgun@${this.options.domain}>`);
        form.append('to', `${process.env.MAILGUN_FROMEMAIL}`);
        form.append('subject', subject);
        form.append('template', template);
        emailVars.forEach(eVar => form.append(`${eVar.key}`, eVar.value));
        try {
            await got.post(
                //post를 적으면 jest에서 post의 implementation을 mock할 수 있고, post가 테스트에 통과하지 못하도록 만들 수 있다
                `https://api.mailgun.net/v3/${this.options.domain}/messages`, 
                {
                headers: {
                    Authorization: `basic ${Buffer.from(
                        `api:${this.options.apiKey}`
                        ).toString('base64')}`
                },
                body: form
            });
            return true
        } catch (error) {
            return false
        }
       
    }

    sendVerificationEmail(email: string, code: string){
        this.sendEmail('Verify Your Email', 'youber-eats',[
            { key: 'code', value: code },
            { key: 'username', value: email}
        ]);
    }

}
