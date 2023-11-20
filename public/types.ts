import { NavigationPublicPluginStart } from '../../../src/plugins/navigation/public';

export interface SearchForIdPluginSetup {
  getGreeting: () => string;
}
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface SearchForIdPluginStart {}

export interface AppPluginStartDependencies {
  navigation: NavigationPublicPluginStart;
}
