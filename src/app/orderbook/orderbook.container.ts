import { container } from 'inversify-props';
import { IOrderbookService, OrderbookService } from './shared';

export default () => {
  container.addSingleton<IOrderbookService>(OrderbookService);
};
