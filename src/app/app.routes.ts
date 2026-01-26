import { Routes } from '@angular/router';
import { HomePage } from './transitions/features/pages/home.page';

import { ProductListComponent } from './components/pages/product-list/product-list.component';

export const routes: Routes = [
  { path: '', component: HomePage },
  { path: 'products', component: ProductListComponent },
  { path: '**', redirectTo: '' }
];
