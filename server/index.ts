import { PluginInitializerContext } from '../../../src/core/server';
import { MonitorCallIdPlugin } from './plugin';

//  This exports static code and TypeScript types,
//  as well as, Kibana Platform `plugin()` initializer.

export function plugin(initializerContext: PluginInitializerContext) {
  return new MonitorCallIdPlugin(initializerContext);
}

export { MonitorCallIdPluginSetup, MonitorCallIdPluginStart } from './types';
