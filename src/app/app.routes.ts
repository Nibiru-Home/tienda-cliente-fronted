import { Routes } from '@angular/router';
import { IndexPage } from './components/pages/index/index';
import { ProductListComponent } from './components/pages/product-list/product-list';
import { Login } from './components/pages/login/login';
import { ProductDetailPage } from './components/pages/product-detail/product-detail';
import { Register } from './components/pages/register/register';
import { CartComponent } from './components/pages/cart/cart.component';
import { PaymentComponent } from './components/pages/payment/payment.component';
import { ProfileComponent } from './components/pages/profile/profile.component';

export const routes: Routes = [
  { path: '', component: IndexPage },
  { path: 'products', component: ProductListComponent },
  { path: 'login', component: Login },
  { path: 'register', component: Register },
  { path: 'products/:id', component: ProductDetailPage },
  { path: 'cart', component: CartComponent },
  { path: 'checkout/payment', component: PaymentComponent },
  { path: 'profile', component: ProfileComponent },
  { path: '**', redirectTo: '' }
];
