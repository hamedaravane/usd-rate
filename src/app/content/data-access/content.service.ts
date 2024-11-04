import { Injectable } from '@angular/core';
import { ContentInfra } from '../infra/content.infra';
import { DailyRate } from '../entity/content.entity';

@Injectable({
  providedIn: 'root'
})
export class ContentService {
  constructor(private contentInfra: ContentInfra) {}

  getExchangeRates(): Promise<DailyRate[]> {
    return this.contentInfra.getExchangeRates();
  }
}
