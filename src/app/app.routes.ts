import { Routes } from '@angular/router';
import { IndexPage } from './components/pages/index/index';
import { ProductListComponent } from './components/pages/product-list/product-list';
import { ProductDetailPage } from './components/pages/product-detail/product-detail';

export const routes: Routes = [
  { path: '', component: IndexPage },
  { path: 'products', component: ProductListComponent },
  { path: 'product', component: ProductDetailPage },
  { path: '**', redirectTo: '' }
];
