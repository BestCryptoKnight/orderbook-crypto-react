import React, { Suspense } from 'react';
import { BrowserRouter, Redirect, Route, Switch } from 'react-router-dom';
import { exampleModule } from './example';
import { orderbookModule } from './orderbook';

export default function AppRouter() {
  const LoadingMessage = () => <div>Loading..,</div>;

  return (
    <BrowserRouter>
      <Suspense fallback={<LoadingMessage />}>
        <Switch>
          <Route exact={true} path="/example" render={() => <Redirect to="/example" />} />
          <Route exact={true} path="/" render={() => <Redirect to="/orderbook" />} />
          {exampleModule.routes}
          {orderbookModule.routes}
        </Switch>
      </Suspense>
    </BrowserRouter>
  );
}
