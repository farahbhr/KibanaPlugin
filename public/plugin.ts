import { i18n } from '@kbn/i18n';
import { AppMountParameters, CoreSetup, CoreStart, Plugin } from '../../../src/core/public';
import { DataPublicPluginStart, DataPublicPluginSetup } from '../../../src/plugins/data/public';

import {
  MonitorCallIdPluginSetup,
  MonitorCallIdPluginStart,
  AppPluginStartDependencies,
} from './types';
import { PLUGIN_NAME } from '../common';

export interface AppPluginSetupDependencies{}

export interface AppPluginStartDependencies{
  data: DataPublicPluginStart;

}

export class MonitorCallIdPlugin
  implements Plugin<MonitorCallIdPluginSetup, MonitorCallIdPluginStart>
{
   public setup(core: CoreSetup): MonitorCallIdPluginSetup {
  // Register an application into the side navigation menu

  console.log("public setup");
    core.application.register({
      id: 'monitorCallId',
      title: PLUGIN_NAME,
      async mount(params: AppMountParameters) {
        // Load application bundle
        const { renderApp } = await import('./application');
        // Get start services as specified in kibana.json
        const [coreStart, depsStart] = await core.getStartServices();
        // Render the application
        return renderApp(coreStart, depsStart as AppPluginStartDependencies, params);
      },
    });

    // Return methods that should be available to other plugins
    return {
      getGreeting() {
        return i18n.translate('monitorCallId.greetingText', {
          defaultMessage: 'Hello from {name}!',
          values: {
            name: PLUGIN_NAME,
          },
        });
      },
    };
        // Load application bundle

//	const { MonitorCallIdApp } = await import('./application);
        // Get start services as specified in kibana.js
        // Render the application
//        ReactDOM.render(<MonitorCallIdApp/>, element);
//        return() => ReactDOM.unmountComponentAtNode(element);
//    return{};

    }

  public start(core: CoreStart) {

    console.log("public started");
    return {};
  }

  public stop() {
  }
}
