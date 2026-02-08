import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { CartService } from '../../../services/cart.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrls: ['./login.scss']
})
export class Login {
  authService = inject(AuthService);
  private cartService = inject(CartService);
  private route = inject(ActivatedRoute);
  router = inject(Router);

  email = '';
  password = '';
  errorMessage = '';

  login() {
    this.authService.login({ email: this.email, password: this.password }).subscribe({
      next: (response) => {
        if (response.token) {
          this.authService.saveToken(response.token);
          this.authService.saveUser(response.user.name);
          this.authService.saveUserId(response.user.id);
          this.cartService.loadCart();

          const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
          if (this.isValidReturnUrl(returnUrl)) {
            this.router.navigateByUrl(returnUrl);
          } else {
            this.router.navigate(['/'], { queryParams: { skipIntro: 'true' } });
          }
        } else {
          this.errorMessage = 'Acceso denegado: Rol no autorizado';
        }
      },
      error: (error: any) => {
        this.errorMessage = 'Credenciales inválidas o error de conexión';
      }
    });
  }

  private isValidReturnUrl(url: string | null): url is string {
    return !!url && url.startsWith('/') && !url.startsWith('/login');
  }
}
