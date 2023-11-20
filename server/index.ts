import { PluginInitializerContext } from '../../../src/core/server';
import { SearchForIdPlugin } from './plugin';

//  This exports static code and TypeScript types,
//  as well as, Kibana Platform `plugin()` initializer.

export function plugin(initializerContext: PluginInitializerContext) {
  return new SearchForIdPlugin(initializerContext);
}

export { SearchForIdPluginSetup, SearchForIdPluginStart } from './types';
