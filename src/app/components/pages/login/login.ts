import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
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
          console.log('Login response:', response);
          const role = response.user?.role?.toUpperCase()?.trim();
          console.log('Normalized User role:', role);

          if (role === 'ADMIN' || role === 'ROLE_ADMIN') {
            this.authService.saveToken(response.token);
            this.authService.saveUser(response.user.name);
            this.router.navigate(['/admin']);
          } else {
            console.warn('Access denied. Normalized role:', role);
            this.errorMessage = 'Acceso denegado: No tienes permisos de administrador';
          }
        }
      },
      error: (error) => {
        console.error('Login error', error);
        this.errorMessage = 'Credenciales inválidas o error de conexión';
      }
    });
    console.log(this.email, this.password);
    console.log(this.errorMessage);

  }
}
