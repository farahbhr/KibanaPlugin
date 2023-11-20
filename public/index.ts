import './index.scss';

import { SearchForIdPlugin } from './plugin';

// This exports static code and TypeScript types,
// as well as, Kibana Platform `plugin()` initializer.
export function plugin() {
  return new SearchForIdPlugin();
}
export { SearchForIdPluginSetup, SearchForIdPluginStart } from './types';
