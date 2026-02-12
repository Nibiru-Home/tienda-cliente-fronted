import { HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { UpdateProfileRequest } from '../../../models/auth.model';
import { User } from '../../../models/user.model';
import { AuthService } from '../../../services/auth.service';

interface ProfileFormModel {
    name: string;
    email: string;
    address: string;
    phone: string;
}

@Component({
    selector: 'app-profile',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterLink],
    templateUrl: './profile.component.html',
    styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
    private readonly authService = inject(AuthService);
    private readonly router = inject(Router);

    readonly form: ProfileFormModel = {
        name: '',
        email: '',
        address: '',
        phone: ''
    };
    readonly placeholders: ProfileFormModel = {
        name: '',
        email: '',
        address: '',
        phone: ''
    };

    isLoading = true;
    isSaving = false;
    successMessage = '';
    errorMessage = '';

    ngOnInit(): void {
        if (!this.authService.isAuthenticated()) {
            this.router.navigate(['/login'], {
                queryParams: { returnUrl: '/profile' }
            });
            return;
        }

        this.reloadProfile();
    }

    reloadProfile(): void {
        const userId = this.authService.getUserId();
        if (!userId) {
            this.router.navigate(['/login'], {
                queryParams: { returnUrl: '/profile' }
            });
            return;
        }

        this.errorMessage = '';
        this.successMessage = '';
        this.isLoading = true;

        this.authService.getUserById(userId).pipe(
            finalize(() => {
                this.isLoading = false;
            })
        ).subscribe({
            next: (user) => {
                this.applyUserToForm(user);
            },
            error: (error) => {
                this.errorMessage = this.getLoadErrorMessage(error);
            }
        });
    }

    saveProfile(): void {
        if (this.isSaving || this.isLoading) {
            return;
        }

        const userId = this.authService.getUserId();
        if (!userId) {
            this.router.navigate(['/login'], {
                queryParams: { returnUrl: '/profile' }
            });
            return;
        }

        this.errorMessage = '';
        this.successMessage = '';

        const payload = this.buildPayload();
        this.isSaving = true;

        this.authService.updateProfile(userId, payload).pipe(
            finalize(() => {
                this.isSaving = false;
            })
        ).subscribe({
            next: (user) => {
                this.applyUserToForm(user);
                this.authService.saveUser(user?.name?.trim() || payload.name);
                this.successMessage = 'Tus datos se han actualizado correctamente.';
            },
            error: (error) => {
                this.errorMessage = this.getSaveErrorMessage(error);
            }
        });
    }

    private buildPayload(): UpdateProfileRequest {
        return {
            name: this.form.name.trim(),
            email: this.form.email.trim().toLowerCase(),
            address: this.form.address.trim(),
            phone: this.form.phone.trim()
        };
    }

    private applyUserToForm(user: User): void {
        const normalized: ProfileFormModel = {
            name: (user?.name ?? '').trim(),
            email: (user?.email ?? '').trim(),
            address: (user?.address ?? '').trim(),
            phone: (user?.phone ?? '').trim()
        };

        this.placeholders.name = normalized.name;
        this.placeholders.email = normalized.email;
        this.placeholders.address = normalized.address;
        this.placeholders.phone = normalized.phone;

        this.form.name = normalized.name;
        this.form.email = normalized.email;
        this.form.address = normalized.address;
        this.form.phone = normalized.phone;
    }

    private getLoadErrorMessage(error: unknown): string {
        if (error instanceof HttpErrorResponse) {
            if (error.status === 0) {
                return 'No se pudo conectar con el backend local.';
            }
            return `No se pudo cargar tu perfil (HTTP ${error.status}).`;
        }
        return 'No se pudo cargar tu perfil.';
    }

    private getSaveErrorMessage(error: unknown): string {
        if (error instanceof HttpErrorResponse) {
            if (error.status === 0) {
                return 'No se pudo conectar con el backend local.';
            }

            const backendMessage = this.extractBackendMessage(error.error);
            if (backendMessage) {
                return backendMessage;
            }

            return `No se pudo guardar tu perfil (HTTP ${error.status}).`;
        }
        return 'No se pudo guardar tu perfil.';
    }

    private extractBackendMessage(errorBody: unknown): string | null {
        if (typeof errorBody === 'string' && errorBody.trim()) {
            return errorBody;
        }

        if (errorBody && typeof errorBody === 'object') {
            const body = errorBody as Record<string, unknown>;
            const candidates = [body['error'], body['message']];
            for (const value of candidates) {
                if (typeof value === 'string' && value.trim()) {
                    return value;
                }
            }
        }

        return null;
    }
}
