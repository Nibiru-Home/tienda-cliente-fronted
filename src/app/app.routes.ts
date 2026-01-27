import { Routes } from '@angular/router';
import { IndexPage } from './components/pages/index/index';
import { ProductListComponent } from './components/pages/product-list/product-list';
import { Login } from './components/pages/login/login';

export const routes: Routes = [
  { path: '', component: IndexPage },
  { path: 'products', component: ProductListComponent },
  { path: 'login', component: Login },
  { path: '**', redirectTo: '' }
];
