import { Routes } from '@angular/router';
import { IndexPage } from './components/pages/index/index';
import { ProductListComponent } from './components/pages/product-list/product-list';

export const routes: Routes = [
  { path: '', component: IndexPage },
  { path: 'products', component: ProductListComponent },
  { path: '**', redirectTo: '' }
];
