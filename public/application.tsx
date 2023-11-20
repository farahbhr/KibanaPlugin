import React from 'react';
import ReactDOM from 'react-dom';
import { AppMountParameters, CoreStart } from '../../../src/core/public';
import { AppPluginStartDependencies } from './types';
import { MonitorCallIdApp } from './components/app';

export const renderApp = (
  { notifications, uiSettings, http }: CoreStart,
  { data, navigation }: AppPluginStartDependencies,
  { appBasePath, element }: AppMountParameters
) => {
  ReactDOM.render(
    <MonitorCallIdApp
      basename={appBasePath}
      notifications={notifications}
      http={http}
      navigation={navigation}
      uiSettings={uiSettings}
      data={data}
    />,
    element
  );

  return () => ReactDOM.unmountComponentAtNode(element);
};
