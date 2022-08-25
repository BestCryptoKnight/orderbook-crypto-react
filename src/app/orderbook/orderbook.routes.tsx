import React, { lazy } from 'react';
import { Route } from 'react-router-dom';

export default <Route exact={true} path="/orderbook" component={lazy(() => import('./Orderbook'))} />;
