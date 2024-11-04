import {Injectable} from '@angular/core';
import {DailyRate} from '../entity/content.entity';
import {lastValueFrom} from 'rxjs';
import {HttpClient} from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ContentInfra {
  constructor(private http: HttpClient) {}

  getExchangeRates(): Promise<DailyRate[]> {
    return lastValueFrom(this.http.get<DailyRate[]>('/json/exchange-rate.json'));
  }
}