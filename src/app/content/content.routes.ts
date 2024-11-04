import {Routes} from '@angular/router';
import {AppContentComponent} from './component/content/app-content.component';

export const contentRoutes: Routes = [
  {
    path: '',
    component: AppContentComponent,
  },
  {
    path: '**',
    redirectTo: ''
  }
];
