import { inject } from 'inversify-hooks';
import { ILogService } from '~/app/shared';
import { IOrderbookService } from './iservice';

export class OrderbookService implements IOrderbookService {
  @inject() private logService: ILogService;

  public get(): void {
    this.logService.get();
  }
}
