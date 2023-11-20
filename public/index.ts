import './index.scss';

import { MonitorCallIdPlugin } from './plugin';

// This exports static code and TypeScript types,
// as well as, Kibana Platform `plugin()` initializer.
export function plugin() {
  return new MonitorCallIdPlugin();
}
export { MonitorCallIdPluginSetup, MonitorCallIdPluginStart } from './types';
