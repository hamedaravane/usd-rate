import { AfterViewInit, Component, computed, inject, signal } from '@angular/core';
import { ChartData, ChartOptions } from 'chart.js';
import Chart from 'chart.js/auto';
import { BaseChartDirective } from 'ng2-charts';
import { DailyRate } from '../../entity/content.entity';
import { ContentService } from '../../data-access/content.service';
import { NzTypographyModule } from 'ng-zorro-antd/typography';
import { DecimalPipe } from '@angular/common';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { FormsModule } from '@angular/forms';
import { NzInputModule } from 'ng-zorro-antd/input';

Chart.defaults.font.family = 'Vazirmatn';

interface Metrics {
  days: number;
  minPrice: number;
  maxPrice: number;
  medianPrice: number;
  avgPrice: number;
  stdDev: number;
  dailyChanges: number;
  monthlyChanges: number;
  yearlyChanges: number;
  overallGrowthRate: number;
  dailyGrowthRate: number;
  monthlyGrowthRate: number;
  yearlyGrowthRate: number;
}

@Component({
  selector: 'app-content',
  standalone: true,
  imports: [BaseChartDirective, NzTypographyModule, NzTableModule, NzInputModule, NzToolTipModule, NzDatePickerModule, DecimalPipe, FormsModule],
  templateUrl: './app-content.component.html'
})
export class AppContentComponent implements AfterViewInit {
  private readonly contentService = inject(ContentService);
  public readonly formatter = new Intl.DateTimeFormat('fa-IR-u-nu-latn');
  defaultStartDate = new Date('2023-11-25');
  defaultEndDate = new Date();
  date: Date[] | null = [this.defaultStartDate, this.defaultEndDate];
  initialValue = signal(100000000);
  adjustedValue = computed(() => {
    return this.initialValue() * (1 + this.metrics().overallGrowthRate / 100);
  });
  metrics = signal<Metrics>({
    days: 0,
    minPrice: 0,
    maxPrice: 0,
    medianPrice: 0,
    avgPrice: 0,
    stdDev: 0,
    dailyChanges: 0,
    monthlyChanges: 0,
    yearlyChanges: 0,
    overallGrowthRate: 0,
    dailyGrowthRate: 0,
    monthlyGrowthRate: 0,
    yearlyGrowthRate: 0
  });

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
          text: 'تاریخ'
        },
        bounds: 'data',
        clip: false
      },
      y: {
        display: true,
        title: {
          display: false,
          text: 'قیمت'
        }
      }
    }
  };

  ngAfterViewInit() {
    this.fetchData().then(rates => {
      if (this.date) {
        const filteredData = this.filterDataByDateRange(rates, this.date[0], this.date[1]);
        this.initializeChart(filteredData);
        this.calculateMetrics(filteredData);
      }
    });
  }

  private filterDataByDateRange(data: DailyRate[], startDate: Date, endDate: Date): DailyRate[] {
    return data.filter(rate => {
      const rateDate = new Date(rate.date);
      return rateDate >= startDate && rateDate <= endDate;
    });
  }

  private calculateMetrics(data: DailyRate[]): void {
    const prices = data.map(rate => rate.price);
    const days = prices.length;

    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const medianPrice = this.calculateMedian(prices);
    const avgPrice = this.calculateAverage(prices);
    const stdDev = this.calculateStandardDeviation(prices, avgPrice);
    const dailyChanges = this.calculateDailyChanges(prices);
    const monthlyChanges = this.calculateMonthlyChanges(prices);
    const yearlyChanges = this.calculateYearlyChanges(prices);

    const priceChange = prices[prices.length - 1] - prices[0];
    const overallGrowthRate = (priceChange / prices[0]) * 100;
    const dailyGrowthRate = this.calculateGrowthRate(prices, days);
    const monthlyGrowthRate = this.calculateGrowthRate(prices, days / 30);
    const yearlyGrowthRate = this.calculateGrowthRate(prices, days / 365);

    this.metrics.set({
      days,
      minPrice,
      maxPrice,
      medianPrice,
      avgPrice,
      stdDev,
      dailyChanges,
      monthlyChanges,
      yearlyChanges,
      overallGrowthRate,
      dailyGrowthRate,
      monthlyGrowthRate,
      yearlyGrowthRate
    });
  }

  initializeChart(dailyRates: DailyRate[]) {
    const labels = dailyRates
      .map(dailyRate => {
        const date = new Date(dailyRate.date);
        return this.formatter.format(date);
      })
      .reverse();
    const price: number[] = dailyRates.map(dailyRate => dailyRate.price).reverse();
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

  onDatePickerChange(result: Date[]): void {
    this.fetchData().then(rates => {
      const filteredData = this.filterDataByDateRange(rates, result[0], result[1]);
      this.initializeChart(filteredData);
      this.calculateMetrics(filteredData);
    });
  }

  private calculateMedian(prices: number[]): number {
    const sorted = prices.slice().sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
  }

  private calculateAverage(prices: number[]): number {
    return prices.reduce((sum, price) => sum + price, 0) / prices.length;
  }

  private calculateStandardDeviation(prices: number[], avg: number): number {
    const variance = prices.reduce((sum, price) => sum + Math.pow(price - avg, 2), 0) / prices.length;
    return Math.sqrt(variance);
  }

  private calculateDailyChanges(prices: number[]): number {
    if (prices.length < 2) return 0;

    const dailyChanges = [];
    for (let i = 1; i < prices.length; i++) {
      const change = prices[i] - prices[i - 1];
      dailyChanges.push(change);
    }

    return dailyChanges.reduce((sum, change) => sum - change, 0) / dailyChanges.length;
  }

  private calculateMonthlyChanges(prices: number[]): number {
    if (prices.length < 30) return 0;

    const monthlyChanges = [];
    for (let i = 30; i < prices.length; i += 30) {
      const change = prices[i] - prices[i - 30];
      monthlyChanges.push(change);
    }

    return monthlyChanges.reduce((sum, change) => sum - change, 0) / monthlyChanges.length;
  }

  private calculateYearlyChanges(prices: number[]): number {
    if (prices.length < 365) return 0;

    const yearlyChanges = [];
    for (let i = 365; i < prices.length; i += 365) {
      const change = prices[i] - prices[i - 365];
      yearlyChanges.push(change);
    }

    return yearlyChanges.reduce((sum, change) => sum - change, 0) / yearlyChanges.length;
  }

  private calculateGrowthRate(prices: number[], periods: number): number {
    return (Math.pow(prices[prices.length - 1] / prices[0], 1 / periods) - 1) * 100;
  }

  private fetchData(): Promise<DailyRate[]> {
    return this.contentService.getExchangeRates();
  }
}
