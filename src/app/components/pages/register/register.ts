import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
    selector: 'app-register',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterLink],
    templateUrl: './register.html',
    styleUrls: ['./register.scss']
})
export class Register {
    authService = inject(AuthService);
    router = inject(Router);

    name = '';
    email = '';
    password = '';
    address = '';
    phone = '';
    errorMessage = '';

    register() {
        this.authService.register({
            name: this.name,
            email: this.email,
            password: this.password,
            address: this.address,
            phone: this.phone
        }).subscribe({
            next: (response) => {
                console.log('Register response:', response);
                // On success, redirect to login
                this.router.navigate(['/login']);
            },
            error: (error) => {
                // Backend returns a JSON object with a 'message' field in the 'error' property of the HttpErrorResponse
                const serverMessage = error.error?.message || error.message || 'Error desconocido';
                this.errorMessage = `Error: ${serverMessage}`;
            }
        });
    }
}
