import { Test } from '@nestjs/testing';
import IORedis, { Redis } from 'ioredis';
import {
    createProviders,
    createAsyncProviders,
    createAsyncOptionsProvider,
    redisClientsProvider,
    createRedisClientProviders
} from './redis.providers';
import { RedisOptionsFactory, RedisModuleAsyncOptions, RedisClients, RedisModuleOptions } from './interfaces';
import { REDIS_OPTIONS, REDIS_CLIENTS, DEFAULT_REDIS_NAMESPACE } from './redis.constants';
import { namespaces, quitClients } from './common';
import { RedisService } from './redis.service';
import { testConfig } from '../../test/env';

class RedisConfigService implements RedisOptionsFactory {
    createRedisOptions(): RedisModuleOptions {
        return {};
    }
}

describe(`${createProviders.name}`, () => {
    test('should work correctly', () => {
        expect(createProviders({})).toEqual({
            provide: REDIS_OPTIONS,
            useValue: {}
        });
    });
});

describe(`${createAsyncProviders.name}`, () => {
    test('if provide useFactory or useExisting, the result array should have 2 members', () => {
        expect(createAsyncProviders({ useFactory: () => ({}), inject: [] })).toHaveLength(1);
        expect(createAsyncProviders({ useExisting: RedisConfigService })).toHaveLength(1);
    });

    test('if provide useClass, the result array should have 3 members', () => {
        expect(createAsyncProviders({ useClass: RedisConfigService })).toHaveLength(2);
    });

    test('should throw an error without options', () => {
        expect(() => createAsyncProviders({})).toThrow();
    });
});

describe(`${createAsyncOptionsProvider.name}`, () => {
    test('should create provider with useFactory', () => {
        const options: RedisModuleAsyncOptions = { useFactory: () => ({}), inject: ['DIToken'] };

        expect(createAsyncOptionsProvider(options)).toEqual({ provide: REDIS_OPTIONS, ...options });
    });

    test('should create provider with useClass', () => {
        const options: RedisModuleAsyncOptions = { useClass: RedisConfigService };

        expect(createAsyncOptionsProvider(options)).toHaveProperty('provide', REDIS_OPTIONS);
        expect(createAsyncOptionsProvider(options)).toHaveProperty('useFactory');
        expect(createAsyncOptionsProvider(options)).toHaveProperty('inject', [RedisConfigService]);
    });

    test('should create provider with useExisting', () => {
        const options: RedisModuleAsyncOptions = { useExisting: RedisConfigService };

        expect(createAsyncOptionsProvider(options)).toHaveProperty('provide', REDIS_OPTIONS);
        expect(createAsyncOptionsProvider(options)).toHaveProperty('useFactory');
        expect(createAsyncOptionsProvider(options)).toHaveProperty('inject', [RedisConfigService]);
    });

    test('should create provider without options', () => {
        expect(createAsyncOptionsProvider({})).toEqual({ provide: REDIS_OPTIONS, useValue: {} });
    });
});

describe('redisClientsProvider', () => {
    describe('with multiple clients', () => {
        let clients: RedisClients;

        let redisService: RedisService;

        afterAll(() => {
            quitClients(clients);
        });

        beforeAll(async () => {
            const options: RedisModuleOptions = {
                defaultOptions: {
                    port: testConfig.master.port
                },
                config: [
                    {
                        host: testConfig.master.host,
                        password: testConfig.master.password,
                        namespace: 'client0',
                        db: 0
                    },
                    {
                        host: testConfig.master.host,
                        password: testConfig.master.password,
                        db: 1
                    }
                ]
            };

            const moduleRef = await Test.createTestingModule({
                providers: [{ provide: REDIS_OPTIONS, useValue: options }, redisClientsProvider, RedisService]
            }).compile();

            clients = moduleRef.get<RedisClients>(REDIS_CLIENTS);
            redisService = moduleRef.get<RedisService>(RedisService);
        });

        test('should have 2 members', () => {
            expect(clients.size).toBe(2);
        });

        test('should get a client with namespace', async () => {
            const client = redisService.getClient('client0');

            await expect(client.ping()).resolves.toBeDefined();
        });

        test('should get default client with namespace', async () => {
            const client = redisService.getClient(DEFAULT_REDIS_NAMESPACE);

            await expect(client.ping()).resolves.toBeDefined();
        });
    });

    describe('with single client', () => {
        let clients: RedisClients;

        let redisService: RedisService;

        afterAll(() => {
            quitClients(clients);
        });

        beforeAll(async () => {
            const options: RedisModuleOptions = {
                config: {
                    host: testConfig.master.host,
                    port: testConfig.master.port,
                    password: testConfig.master.password
                }
            };

            const moduleRef = await Test.createTestingModule({
                providers: [{ provide: REDIS_OPTIONS, useValue: options }, redisClientsProvider, RedisService]
            }).compile();

            clients = moduleRef.get<RedisClients>(REDIS_CLIENTS);
            redisService = moduleRef.get<RedisService>(RedisService);
        });

        test('should have 1 member', () => {
            expect(clients.size).toBe(1);
        });

        test('should get default client with namespace', async () => {
            const client = redisService.getClient(DEFAULT_REDIS_NAMESPACE);

            await expect(client.ping()).resolves.toBeDefined();
        });
    });

    describe('without options', () => {
        let clients: RedisClients;

        let redisService: RedisService;

        afterAll(() => {
            quitClients(clients);
        });

        beforeAll(async () => {
            const moduleRef = await Test.createTestingModule({
                providers: [{ provide: REDIS_OPTIONS, useValue: {} }, redisClientsProvider, RedisService]
            }).compile();

            clients = moduleRef.get<RedisClients>(REDIS_CLIENTS);
            redisService = moduleRef.get<RedisService>(RedisService);
        });

        test('should have 1 member', () => {
            expect(clients.size).toBe(1);
        });

        test('should get default client with namespace', () => {
            const client = redisService.getClient(DEFAULT_REDIS_NAMESPACE);

            expect(client).toBeInstanceOf(IORedis);
        });
    });
});

describe(`${createRedisClientProviders.name}`, () => {
    const clients: RedisClients = new Map();

    let client0: Redis;
    let client1: Redis;

    afterAll(() => {
        quitClients(clients);
    });

    beforeAll(async () => {
        namespaces.push(...['client0', 'client1']);

        clients.set('client0', new IORedis({ ...testConfig.master, db: 0 }));
        clients.set('client1', new IORedis({ ...testConfig.master, db: 1 }));

        const moduleRef = await Test.createTestingModule({
            providers: [{ provide: REDIS_CLIENTS, useValue: clients }, RedisService, ...createRedisClientProviders()]
        }).compile();

        client0 = moduleRef.get<Redis>('client0');
        client1 = moduleRef.get<Redis>('client1');
    });

    test('client0 should work correctly', async () => {
        await expect(client0.ping()).resolves.toBeDefined();
    });

    test('client1 should work correctly', async () => {
        await expect(client1.ping()).resolves.toBeDefined();
    });
});
