import { Routes } from '@angular/router';
import { HomePage } from './transitions/features/pages/home.page';

export const routes: Routes = [
  { path: '', component: HomePage },
  { path: '**', redirectTo: '' }
];
