import React from 'react';
import ReactDOM from 'react-dom';
import { AppMountParameters, CoreStart } from '../../../src/core/public';
import { AppPluginStartDependencies } from './types';
import { SearchForIdApp } from './components/app';

export const renderApp = (
  { notifications, uiSettings, http }: CoreStart,
  { data, navigation }: AppPluginStartDependencies,
  { appBasePath, element }: AppMountParameters
) => {
  ReactDOM.render(
    <SearchForId
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
