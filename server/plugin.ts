import {
  PluginInitializerContext,
  CoreSetup,
  CoreStart,
  Plugin,
  Logger,
} from '../../../src/core/server';

import { MonitorCallIdPluginSetup, MonitorCallIdPluginStart } from './types';
import { defineRoutes , retryClusterCall  } from './routes';

import { INDEX_NAME } from '../common';

export class MonitorCallIdPlugin
  implements Plugin<MonitorCallIdPluginSetup, MonitorCallIdPluginStart>
{
  private readonly logger: Logger;

  constructor(initializerContext: PluginInitializerContext) {
    this.logger = initializerContext.logger.get();
  }

  public setup(core: CoreSetup) {
    this.logger.debug('monitorCallID: Server Setup');

    this.router = core.http.createRouter();

    //    defineRoutes(router);
    // Register server side APIs
    // router.get({ path: '/path', validate: false }, (context, req, res) => res.ok({ content: 'ok' }));

    this.logger.debug('monitorCallID: finish Server Setup');

    return {};
  }

  public start(core: CoreStart) {
    this.logger.debug('monitorCallID: Server Started');

    defineRoutes({
      logger: this.logger,
      router: this.router,
      clusterClient: core.elasticsearch.client,
      });

    return {};
  }

  public stop() {
    this.logger.debug('monitorCallID: Server Stop');
  }
}
