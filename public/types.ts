import { NavigationPublicPluginStart } from '../../../src/plugins/navigation/public';

export interface MonitorCallIdPluginSetup {
  getGreeting: () => string;
}
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface MonitorCallIdPluginStart {}

export interface AppPluginStartDependencies {
  navigation: NavigationPublicPluginStart;
}
