import { Routes } from '@angular/router';
import { IndexPage } from './components/pages/index/index';

export const routes: Routes = [
  { path: '', component: IndexPage },

  { path: '**', redirectTo: '' }
];
