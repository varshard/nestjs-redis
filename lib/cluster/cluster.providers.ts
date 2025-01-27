import { Provider, FactoryProvider, ValueProvider } from '@nestjs/common';
import { Cluster } from 'ioredis';
import { ClusterModuleOptions, ClusterModuleAsyncOptions, ClusterOptionsFactory, ClusterClients } from './interfaces';
import { CLUSTER_OPTIONS, CLUSTER_CLIENTS, DEFAULT_CLUSTER_NAMESPACE } from './cluster.constants';
import { RedisError, MISSING_CONFIGURATION } from '@/errors';
import { createClient, namespaces } from './common';
import { ClusterService } from './cluster.service';

export const createProviders = (options: ClusterModuleOptions): ValueProvider<ClusterModuleOptions> => ({
    provide: CLUSTER_OPTIONS,
    useValue: options
});

export const createAsyncProviders = (options: ClusterModuleAsyncOptions): Provider[] => {
    if (!options.useFactory && !options.useClass && !options.useExisting) throw new RedisError(MISSING_CONFIGURATION);

    if (options.useClass) {
        return [
            {
                provide: options.useClass,
                useClass: options.useClass
            },
            createAsyncOptionsProvider(options)
        ];
    }

    if (options.useFactory || options.useExisting) return [createAsyncOptionsProvider(options)];

    return [];
};

export const createAsyncOptionsProvider = (options: ClusterModuleAsyncOptions): Provider => {
    if (options.useFactory) {
        return {
            provide: CLUSTER_OPTIONS,
            useFactory: options.useFactory,
            inject: options.inject
        };
    }

    if (options.useClass) {
        return {
            provide: CLUSTER_OPTIONS,
            useFactory: async (optionsFactory: ClusterOptionsFactory): Promise<ClusterModuleOptions> =>
                await optionsFactory.createClusterOptions(),
            inject: [options.useClass]
        };
    }

    if (options.useExisting) {
        return {
            provide: CLUSTER_OPTIONS,
            useFactory: async (optionsFactory: ClusterOptionsFactory): Promise<ClusterModuleOptions> =>
                await optionsFactory.createClusterOptions(),
            inject: [options.useExisting]
        };
    }

    return {
        provide: CLUSTER_OPTIONS,
        useValue: {}
    };
};

export const clusterClientsProvider: FactoryProvider<ClusterClients> = {
    provide: CLUSTER_CLIENTS,
    useFactory: (options: ClusterModuleOptions) => {
        const clients: ClusterClients = new Map();

        if (Array.isArray(options.config)) {
            options.config.forEach(item =>
                clients.set(item.namespace ?? DEFAULT_CLUSTER_NAMESPACE, createClient(item))
            );

            return clients;
        }

        clients.set(options.config.namespace ?? DEFAULT_CLUSTER_NAMESPACE, createClient(options.config));

        return clients;
    },
    inject: [CLUSTER_OPTIONS]
};

export const createClusterClientProviders = (): FactoryProvider<Cluster>[] => {
    const providers: FactoryProvider<Cluster>[] = [];

    namespaces.forEach(namespace => {
        providers.push({
            provide: namespace,
            useFactory: (clusterService: ClusterService) => clusterService.getClient(namespace),
            inject: [ClusterService]
        });
    });

    return providers;
};
