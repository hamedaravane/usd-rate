import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideHttpClient } from '@angular/common/http';
import { NzConfig, provideNzConfig } from 'ng-zorro-antd/core/config';
import { registerLocaleData } from '@angular/common';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { fa_IR, provideNzI18n } from 'ng-zorro-antd/i18n';
import en from '@angular/common/locales/en';
import fa from '@angular/common/locales/fa';
import { provideCharts, withDefaultRegisterables } from 'ng2-charts';

registerLocaleData(en);
registerLocaleData(fa);

const ngZorroConfig: NzConfig = {
  message: { nzDirection: 'rtl' },
  modal: { nzDirection: 'rtl' },
  drawer: { nzDirection: 'rtl' },
  notification: { nzDirection: 'rtl' },
  image: { nzCloseOnNavigation: true, nzDirection: 'rtl' },
  table: {
    nzBordered: true,
    nzSize: 'small',
    nzShowQuickJumper: true,
    nzShowSizeChanger: true,
    nzSimple: true,
    nzHideOnSinglePage: true
  }
  // empty: { nzDefaultEmptyContent: '' }
};

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(),
    provideNzI18n(fa_IR),
    provideAnimationsAsync(),
    provideNzConfig(ngZorroConfig),
    provideCharts(withDefaultRegisterables())
  ]
};
