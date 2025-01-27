import { ClusterCoreModule } from './cluster-core.module';
import { ClusterModuleAsyncOptions, ClusterModuleOptions } from './interfaces';

const clusterModuleOptions: ClusterModuleOptions = { config: { nodes: [] } };

describe(`${ClusterCoreModule.forRoot.name}`, () => {
    test('should register the module with options', () => {
        expect(ClusterCoreModule.forRoot(clusterModuleOptions).module).toBe(ClusterCoreModule);
        expect(ClusterCoreModule.forRoot(clusterModuleOptions).providers?.length).toBeGreaterThanOrEqual(3);
        expect(ClusterCoreModule.forRoot(clusterModuleOptions).exports?.length).toBeGreaterThanOrEqual(1);
    });
});

describe(`${ClusterCoreModule.forRootAsync.name}`, () => {
    const options: ClusterModuleAsyncOptions = { imports: [], useFactory: () => clusterModuleOptions, inject: [] };

    test('should register the async module with async options', () => {
        expect(ClusterCoreModule.forRootAsync(options).module).toBe(ClusterCoreModule);
        expect(ClusterCoreModule.forRootAsync(options).imports).toHaveLength(0);
        expect(ClusterCoreModule.forRootAsync(options).providers?.length).toBeGreaterThanOrEqual(3);
        expect(ClusterCoreModule.forRootAsync(options).exports?.length).toBeGreaterThanOrEqual(1);
    });
});
