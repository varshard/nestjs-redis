import { RedisCoreModule } from './redis-core.module';
import { RedisModuleAsyncOptions, RedisModuleOptions } from './interfaces';

describe(`${RedisCoreModule.forRoot.name}`, () => {
    test('should register the module with options', () => {
        const options: RedisModuleOptions = {};

        expect(RedisCoreModule.forRoot(options).module).toBe(RedisCoreModule);
        expect(RedisCoreModule.forRoot(options).providers?.length).toBeGreaterThanOrEqual(3);
        expect(RedisCoreModule.forRoot(options).exports?.length).toBeGreaterThanOrEqual(1);
    });

    test('should register the module without options', () => {
        expect(RedisCoreModule.forRoot().module).toBe(RedisCoreModule);
        expect(RedisCoreModule.forRoot().providers?.length).toBeGreaterThanOrEqual(3);
        expect(RedisCoreModule.forRoot().exports?.length).toBeGreaterThanOrEqual(1);
    });
});

describe(`${RedisCoreModule.forRootAsync.name}`, () => {
    const options: RedisModuleAsyncOptions = { imports: [], useFactory: () => ({}), inject: [] };

    test('should register the async module with async options', () => {
        expect(RedisCoreModule.forRootAsync(options).module).toBe(RedisCoreModule);
        expect(RedisCoreModule.forRootAsync(options).imports).toHaveLength(0);
        expect(RedisCoreModule.forRootAsync(options).providers?.length).toBeGreaterThanOrEqual(3);
        expect(RedisCoreModule.forRootAsync(options).exports?.length).toBeGreaterThanOrEqual(1);
    });
});
