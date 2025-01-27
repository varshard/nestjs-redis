import { Test, TestingModule } from '@nestjs/testing';
import { CatsController } from './cats.controller';
import { CatsService } from './cats.service';

const testCatName3 = 'Test Cat 3';

describe('CatsController', () => {
    let controller: CatsController;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [CatsController],
            providers: [
                {
                    provide: CatsService,
                    useValue: {
                        findAll: jest.fn().mockResolvedValue([
                            {
                                id: 1,
                                name: 'Test Cat 1',
                                age: 1,
                                breed: 'Test Breed 1'
                            },
                            {
                                id: 2,
                                name: 'Test Cat 2',
                                age: 2,
                                breed: 'Test Breed 2'
                            }
                        ]),
                        create: jest
                            .fn()
                            .mockResolvedValue({ id: 3, name: testCatName3, age: 3, breed: 'Test Breed 3' })
                    }
                }
            ]
        }).compile();

        controller = module.get<CatsController>(CatsController);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('findAll', () => {
        test('should return an array of cats', async () => {
            const cats = await controller.findAll();
            expect(cats).toHaveLength(2);
            expect(cats[0].id).toBe(1);
            expect(cats[1].name).toBe('Test Cat 2');
        });
    });

    describe('create', () => {
        test('should create a cat', async () => {
            const newCat = await controller.create({ name: testCatName3, age: 3, breed: 'Test Breed 3' });
            expect(newCat.id).toBe(3);
            expect(newCat.name).toBe(testCatName3);
        });
    });
});
