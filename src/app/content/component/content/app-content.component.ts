import {Component, inject, OnInit} from '@angular/core';
import {ChartData, ChartOptions} from 'chart.js';
import Chart from 'chart.js/auto';
import {BaseChartDirective} from 'ng2-charts';
import {DailyRate} from '../../entity/content.entity';
import {ContentService} from '../../data-access/content.service';
import {NzTypographyModule} from 'ng-zorro-antd/typography';
import {DecimalPipe} from '@angular/common';
import {NzTableModule} from 'ng-zorro-antd/table';
import {NzToolTipModule} from 'ng-zorro-antd/tooltip';
import {NzDatePickerModule} from 'ng-zorro-antd/date-picker';
import {FormsModule} from '@angular/forms';

Chart.defaults.font.family = 'Vazirmatn';

@Component({
  selector: 'app-content',
  standalone: true,
  imports: [BaseChartDirective, NzTypographyModule, NzTableModule, NzToolTipModule, NzDatePickerModule, DecimalPipe, FormsModule],
  templateUrl: './app-content.component.html',
  styles: `:host { @apply container; }`
})
export class AppContentComponent implements OnInit {
  private readonly contentService = inject(ContentService);
  private readonly formatter = new Intl.DateTimeFormat('fa-IR-u-nu-latn');
  date: Date[] | null = null;
  metrics = {
    meanPrice: 0,
    medianPrice: 0,
    priceStandardDeviation: 0,
    priceVariance: 0,
    priceRange: 0,
    maxPrice: 0,
    minPrice: 0,
    meanLow: 0,
    meanHigh: 0,
    averageDailyChange: 0,
    maxDailyChange: 0,
    minDailyChange: 0
  };
  data: ChartData<'line'> = {
    labels: [],
    datasets: []
  };
  options: ChartOptions<'line'> = {
    responsive: true,
    scales: {
      x: {
        display: true,
        title: {
          display: false,
          text: 'تاریخ',
        },
        bounds: 'data',
        clip: false
      },
      y: {
        display: true,
        title: {
          display: false,
          text: 'قیمت',
        },
      }
    }
  };

  ngOnInit(): void {
    this.fetchData().then((rates) => this.initializeChart(rates))
  }

  initializeChart(dailyRates: DailyRate[]) {
    this.metrics = this.calculateMetrics(dailyRates);
    const labels = dailyRates.map(dailyRate => {
      const date = new Date(dailyRate.date);
      return this.formatter.format(date);
    }).reverse();
    const price: number[] = dailyRates.map((dailyRate) => dailyRate.price).reverse();
    this.data = {
      labels,
      datasets: [
        {
          data: price,
          label: 'قیمت',
          pointStyle: 'circle',
          pointRadius: 0,
          fill: true,
          tension: 0.3
        }
      ]
    };
  }

  calculateMetrics(rates: DailyRate[]) {
    const prices = rates.map(rate => rate.price);
    const lows = rates.map(rate => rate.low);
    const highs = rates.map(rate => rate.high);

    const meanPrice = prices.reduce((sum, price) => sum + price, 0) / prices.length;
    const medianPrice = prices.sort((a, b) => a - b)[Math.floor(prices.length / 2)];
    const priceStandardDeviation = Math.sqrt(
      prices.reduce((sum, price) => sum + Math.pow(price - meanPrice, 2), 0) / prices.length
    );
    const priceVariance = Math.pow(priceStandardDeviation, 2);
    const priceRange = Math.max(...prices) - Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const minPrice = Math.min(...prices);
    const meanLow = lows.reduce((sum, low) => sum + low, 0) / lows.length;
    const meanHigh = highs.reduce((sum, high) => sum + high, 0) / highs.length;

    const dailyChanges = prices.slice(1).map((price, index) => price - prices[index]);
    const averageDailyChange = dailyChanges.reduce((sum, change) => sum + change, 0) / dailyChanges.length;
    const maxDailyChange = Math.max(...dailyChanges);
    const minDailyChange = Math.min(...dailyChanges);

    return {
      meanPrice,
      medianPrice,
      priceStandardDeviation,
      priceVariance,
      priceRange,
      maxPrice,
      minPrice,
      meanLow,
      meanHigh,
      averageDailyChange,
      maxDailyChange,
      minDailyChange
    };
  }

  onChange(result: Date[]): void {
    console.log('onChange: ', result);
  }

  private fetchData(): Promise<DailyRate[]> {
    return this.contentService.getExchangeRates()
  }
}
