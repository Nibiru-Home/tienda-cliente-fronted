import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrls: ['./login.scss']
})
export class Login {
  authService = inject(AuthService);
  router = inject(Router);

  email = '';
  password = '';
  errorMessage = '';

  login() {
    this.authService.login({ email: this.email, password: this.password }).subscribe({
      next: (response) => {
        if (response.token) {
          const role = response.user?.role?.toUpperCase()?.trim();

          if (role === 'ADMIN' || role === 'ROLE_ADMIN' || role === 'USER' || role === 'CLIENT' || role === 'CUSTOMER') {
            this.authService.saveToken(response.token);
            this.authService.saveUser(response.user.name);
            this.router.navigate(['/'], { queryParams: { skipIntro: 'true' } });
          } else {
            this.errorMessage = 'Acceso denegado: Rol no autorizado';
          }
        }
      },
      error: (error) => {
        this.errorMessage = 'Credenciales inválidas o error de conexión';
      }
    });
  }
}
