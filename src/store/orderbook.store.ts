import { createStore, ReducerType, useStore } from 'react-hookstore';
import { GenericPayload } from '~/app/core';

const name = 'ROOT/ORDERBOOK';

enum Type {
  SET_LIST = 'ROOT/ORDERBOOK/SET_LIST',
  SET_FEED = 'ROOT/ORDERBOOK/SET_FEED'
}

type Payload = GenericPayload<Type>;

interface State {
  feed: string;
  list: Array<unknown>;
}

const state: State = {
  feed: 'XBT',
  list: null
};

const reducers: ReducerType<State, Payload> = function (state: State, { type, payload }) {
  switch (type) {
    case Type.SET_LIST:
      return { ...state, list: payload };
    case Type.SET_FEED:
      return { ...state, feed: payload };
    default:
      return { ...state };
  }
};

const store = createStore<State>(name, state, reducers);

export const OrderbookStoreType = Type;
export const useOrderbookStore = () => useStore<State>(store);
