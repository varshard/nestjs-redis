import { Injectable, Inject } from '@nestjs/common';
import { Cluster } from 'ioredis';
import { CLUSTER_CLIENTS, DEFAULT_CLUSTER_NAMESPACE } from './cluster.constants';
import { ClusterClients, ClusterClientsService } from './interfaces';
import { RedisError, CLIENT_NOT_FOUND } from '@/errors';
import { parseNamespace } from '@/utils';
import { ClientNamespace } from '@/interfaces';

@Injectable()
export class ClusterService implements ClusterClientsService {
    constructor(@Inject(CLUSTER_CLIENTS) private readonly clusterClients: ClusterClients) {}

    get clients(): ReadonlyMap<ClientNamespace, Cluster> {
        return this.clusterClients;
    }

    getClient(namespace: ClientNamespace = DEFAULT_CLUSTER_NAMESPACE): Cluster {
        const client = this.clusterClients.get(namespace);

        if (!client) throw new RedisError(CLIENT_NOT_FOUND(parseNamespace(namespace), false));

        return client;
    }
}
