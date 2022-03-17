import { Test } from "@nestjs/testing"
import { getRepositoryToken } from "@nestjs/typeorm";
import { JwtService } from "src/jwt/jwt.service";
import { MailService } from "src/mail/mail.service";
import { Repository } from "typeorm";
import { User } from "./entities/user.entity";
import { Verification } from "./entities/verification.entity";
import { UsersService } from "./users.service"

const mockRepository = () => ({
    findOne: jest.fn(),
    save: jest.fn(),
    create: jest.fn(),
    findOneOrFail: jest.fn(),
    delete: jest.fn()
});
//함수로 return하지 않으면 mockRepository이 불릴때 같은 것이라 인식해서 여러번 호출로 받아들임

const mockJwtService = () => ({
    sign: jest.fn(() => 'signed-token'),
    verify: jest.fn()
});

const mockMailService = () => ({
    sendVerificationEmail: jest.fn()
});

type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>

describe("UserService", () => {

    //서비스를 여기저기서 쓰기위해 before 밖에 service 생성
    let service: UsersService;
    let mailService: MailService;
    let jwtService: JwtService;

    let usersRepository: MockRepository<User>;
    let verificationsRepository: MockRepository<Verification>;

    beforeEach(async () => {
        //모듈로 import하고 싶은 것들을 넣는다
        //UserSevice를 위한 독립된 모듈을 제공해 줌
        const module = await Test.createTestingModule({
            providers: [
                UsersService,
                {
                    provide: getRepositoryToken(User),
                    useValue: mockRepository()//함수로 불리니 각각 다른 repository로 인식
                },
                {
                    provide: getRepositoryToken(Verification),
                    useValue: mockRepository()
                },
                {
                    provide: JwtService,
                    useValue: mockJwtService()
                },
                {
                    provide: MailService,
                    useValue: mockMailService()
                },

            ]
        }).compile()
        service = module.get<UsersService>(UsersService);
        mailService = module.get<MailService>(MailService);
        jwtService = module.get<JwtService>(JwtService);
        usersRepository = module.get(getRepositoryToken(User));
        verificationsRepository = module.get(getRepositoryToken(Verification));
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('createAccount', () => {
        const createAccountArg = {
            email: '',
            password: '',
            role: 0
        }
        it('should faild if user exists', async () => {
            //findOne은 이 값을 리턴할 것
            usersRepository.findOne.mockResolvedValue({
                id: 1,
                email: ''
            });

            const result = await service.createAccount(createAccountArg)
            expect(result).toMatchObject({
                ok: false, error: 'There is a user with that email already'
            });
        });

        it('should create a new user', async () => {
            usersRepository.findOne.mockResolvedValue(undefined);
            usersRepository.create.mockReturnValue(createAccountArg);
            usersRepository.save.mockResolvedValue(createAccountArg);

            verificationsRepository.create.mockReturnValue({
                user: createAccountArg
            });
            verificationsRepository.save.mockResolvedValue({
                code: 'code'
            });

            const result = await service.createAccount(createAccountArg);
            //이 함수가 한 번 불릴 것
            expect(usersRepository.create).toHaveBeenCalledTimes(1);
            expect(usersRepository.create).toHaveBeenCalledWith(createAccountArg); //무슨 인수랑 같이 호출되었는가

            expect(usersRepository.save).toHaveBeenCalledTimes(1);
            expect(usersRepository.save).toHaveBeenCalledWith(createAccountArg);

            expect(verificationsRepository.create).toHaveBeenCalledTimes(1);
            expect(verificationsRepository.create).toHaveBeenCalledWith({
                user: createAccountArg
            });

            expect(verificationsRepository.save).toHaveBeenCalledTimes(1);
            expect(verificationsRepository.save).toHaveBeenCalledWith({
                user: createAccountArg
            });

            expect(mailService.sendVerificationEmail).toHaveBeenCalledTimes(1);
            expect(mailService.sendVerificationEmail).toHaveBeenCalledWith(
                expect.any(String),
                expect.any(String)
            );

            expect(result).toEqual({ ok: true });
        });

        it('should fail on exception', async () => {
            usersRepository.findOne.mockRejectedValue(new Error());
            const result = await service.createAccount(createAccountArg);
            expect(result).toEqual({ ok: false, error: "Couldn't create account" })
        })
    });

    describe('login', () => {
        const loginArg = {
            email: '',
            password: ''
        };

        it('should fail if user does not exist', async () => {
            usersRepository.findOne.mockResolvedValue(null)

            const result = await service.login(loginArg)

            expect(usersRepository.findOne).toHaveBeenCalledTimes(1);
            expect(usersRepository.findOne).toHaveBeenCalledWith(
                expect.any(Object),
                expect.any(Object)
            );
            expect(result).toEqual({
                ok: false,
                error: 'User not found'
            })
        })

        it('should fail if the password is wrong', async () => {
            const mockedUser = {
                checkPassword: jest.fn(() => Promise.resolve(false/*true*/))
                //promise를 return하는 mock function. await하고 결과적으로 false가 나온다
                //mockResolvedValue와 같은 역할
            };
            usersRepository.findOne.mockResolvedValue(mockedUser);
            const result = await service.login(loginArg);
            expect(result).toEqual({
                ok: false,
                error: 'Wrong password'
            });
            //함수 checkPassword의 response를 mock했음 -> 결과를 true로 나오게 했기 때문에 진행됨
        });

        it('should return token if password correct', async () => {
            const mockedUser = {
                id: 1,
                checkPassword: jest.fn(() => Promise.resolve(true))
                //promise를 return하는 mock function. await하고 결과적으로 true가 나온다
                //mockResolvedValue와 같은 역할
            };
            usersRepository.findOne.mockResolvedValue(mockedUser);

            const result = await service.login(loginArg);
            expect(jwtService.sign).toHaveBeenCalledTimes(1);
            expect(jwtService.sign).toHaveBeenCalledWith(expect.any(Number));
            //console.log(result)
            expect(result).toEqual({ ok: true, token: 'signed-token' });
        })

        it('should fail on exception', async () => {
            usersRepository.findOne.mockRejectedValue(new Error());
            const result = await service.login(loginArg);
            expect(result).toEqual({
                ok: false,
                error: "Can't log user in"
            });
        });

    });

    describe('findById', () => {
        const findByIdArg = { id: 1 };

        it('should find an existing user', async () => {
            usersRepository.findOneOrFail.mockResolvedValue(findByIdArg);
            const result = await service.findById(1);
            expect(result).toEqual({
                ok: true,
                user: findByIdArg
            });
        });

        it('should fail if no user is found', async () => {
            usersRepository.findOneOrFail.mockRejectedValue(new Error());
            const result = await service.findById(1);
            expect(result).toEqual({ ok: false, error: 'User Not Found' })
        })
    });

    describe('editProfile', () => {

        it('should change email', async () => {
            const oldUser = {
                email: 'bs@old.com',
                verified: true
            };

            const editProfileArg = {
                userId: 1,
                input: { email: 'bs@new.com' }
            };

            const newVerification = {
                code: "code"
            };

            const newUser = {
                email: editProfileArg.input.email,
                verified: false
            }

            usersRepository.findOne.mockResolvedValue(oldUser);
            verificationsRepository.create.mockReturnValue(newVerification);
            verificationsRepository.save.mockReturnValue(newVerification);

            await service.editProfile(editProfileArg.userId, editProfileArg.input);
            expect(usersRepository.findOne).toHaveBeenCalledTimes(1);
            expect(usersRepository.findOne).toHaveBeenCalledWith(editProfileArg.userId);

            expect(verificationsRepository.create).toHaveBeenCalledWith({ user: newUser });
            //verificationsRepository.create는 object와 함께 call돼야 한다. object는 newUser고, newVerification이 return된다 
            expect(verificationsRepository.save).toHaveBeenCalledWith(newVerification);

            expect(mailService.sendVerificationEmail).toHaveBeenCalledTimes(1);
            expect(mailService.sendVerificationEmail).toHaveBeenCalledWith(
                newUser.email,
                newVerification.code
            );
        });

        it('should change password', async () => {
            const editProfileArg = {
                userId: 1,
                input: { password: 'new-password' }
            };
            usersRepository.findOne.mockResolvedValue({ password: 'old' });
            const result = await service.editProfile(editProfileArg.userId, editProfileArg.input);
            expect(usersRepository.save).toHaveBeenCalledTimes(1);
            expect(usersRepository.save).toHaveBeenCalledWith(editProfileArg.input);
            expect(result).toEqual({ ok: true });
        });

        it('should fail on exception', async () => {
            usersRepository.findOne.mockRejectedValue(new Error());
            const result = await service.editProfile(1, { email: '12' });
            expect(result).toEqual({
                ok: false,
                error: 'Could not update profile.'
            })
        })

    });

    describe('verifyEmail', () => {
        it('should verify email', async () => {
            const mockedVerification = {
                user: {
                    verified: false, //verification이 올 땐 user가 verified되기 전임.
                },
                id: 1
            };
            verificationsRepository.findOne.mockResolvedValue(mockedVerification);

            const result = await service.verifyEmail('');

            expect(verificationsRepository.findOne).toHaveBeenCalledTimes(1);
            expect(verificationsRepository.findOne).toHaveBeenCalledWith(
                expect.any(Object),
                expect.any(Object)
            );

            expect(usersRepository.save).toHaveBeenCalledTimes(1);
            expect(usersRepository.save).toHaveBeenCalledWith({
                verified: true
            });

            expect(verificationsRepository.delete).toHaveBeenCalledTimes(1);
            expect(verificationsRepository.delete).toHaveBeenCalledWith(mockedVerification.id);

            expect(result).toEqual({ ok: true })

        });

        it('should fail on verification not found', async () => {
            verificationsRepository.findOne.mockResolvedValue(undefined);
            const result = await service.verifyEmail('');
            expect(result).toEqual({ ok: false, error: "Verification not found" });
        });
        it('should fail on exception', async () => {
            verificationsRepository.findOne.mockRejectedValue(new Error());
            const result = await service.verifyEmail('');
            expect(result).toEqual({ ok: false, error: "Could not verify email" })
        });
    });
});
