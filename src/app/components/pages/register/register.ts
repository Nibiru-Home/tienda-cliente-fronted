import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { HttpErrorResponse } from '@angular/common/http';
import { finalize } from 'rxjs';

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
    cdr = inject(ChangeDetectorRef);

    name = '';
    email = '';
    password = '';
    address = '';
    phone = '';
    errorMessage = '';
    isSubmitting = false;

    register() {
        if (this.isSubmitting) {
            return;
        }

        this.errorMessage = '';
        this.isSubmitting = true;

        const normalizedEmail = this.email.trim().toLowerCase();

        this.authService.register({
            name: this.name.trim(),
            email: normalizedEmail,
            password: this.password,
            address: this.address.trim(),
            phone: this.phone.trim()
        }).pipe(
            finalize(() => {
                this.isSubmitting = false;
                this.cdr.detectChanges();
            })
        ).subscribe({
            next: (response) => {
                console.log('Register response:', response);
                
                this.router.navigate(['/login']);
            },
            error: (error: HttpErrorResponse) => {
                if (error.status === 409) {
                    this.errorMessage = 'Este correo ya está registrado. Inicia sesión o usa otro correo.';
                } else if (error.status === 0) {
                    this.errorMessage = 'No se pudo conectar con el servidor local (http://localhost:8080).';
                } else {
                    const serverMessage = error.error?.message || error.message || 'Error desconocido';
                    this.errorMessage = `Error: ${serverMessage}`;
                }
            }
        });
    }
}
