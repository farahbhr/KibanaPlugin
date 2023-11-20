import {
  PluginInitializerContext,
  CoreSetup,
  CoreStart,
  Plugin,
  Logger,
} from '../../../src/core/server';

import { SearchForIdPluginSetup, SearchForIdPluginStart } from './types';
import { defineRoutes , retryClusterCall  } from './routes';

import { INDEX_NAME } from '../common';

export class SearchForIdPlugin
  implements Plugin<SearchForIdPluginSetup, SearchForIdPluginStart>
{
  private readonly logger: Logger;

  constructor(initializerContext: PluginInitializerContext) {
    this.logger = initializerContext.logger.get();
  }

  public setup(core: CoreSetup) {
    this.logger.debug('SearchForId: Server Setup');

    this.router = core.http.createRouter();

    //    defineRoutes(router);
    // Register server side APIs
    // router.get({ path: '/path', validate: false }, (context, req, res) => res.ok({ content: 'ok' }));

    this.logger.debug('SearchForId: finish Server Setup');

    return {};
  }

  public start(core: CoreStart) {
    this.logger.debug('SearchForId: Server Started');

    defineRoutes({
      logger: this.logger,
      router: this.router,
      clusterClient: core.elasticsearch.client,
      });

    return {};
  }

  public stop() {
    this.logger.debug('SearchForId: Server Stop');
  }
}
