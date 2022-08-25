import { OrderbookStoreType, useOrderbookStore } from '~/store';

export function useOrderbook() {
  // You can use stores directly form components, this is only an example of hook
  const [state, dispatch] = useOrderbookStore();

  function setFeed(payload: string) {
    dispatch({
      type: OrderbookStoreType.SET_FEED,
      payload: payload
    });
  }

  function setList(payload: Array<unknown>) {
    dispatch({
      type: OrderbookStoreType.SET_LIST,
      payload: payload
    });
  }

  return [state, setFeed, setList] as const;
}
