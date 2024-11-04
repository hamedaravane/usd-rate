import {Routes} from '@angular/router';
import {AppComponent} from './app.component';
import {contentRoutes} from './content/content.routes';

export const routes: Routes = [
  {
    path: '',
    component: AppComponent,
    children: contentRoutes,
  },
  {
    path: '**',
    redirectTo: ''
  }
];
