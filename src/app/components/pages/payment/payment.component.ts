import { HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { CartProduct } from '../../../models/cart.model';
import { AuthService } from '../../../services/auth.service';
import { CartService } from '../../../services/cart.service';
import { CheckoutPaymentRequest, PaymentService } from '../../../services/payment.service';
import { buildProductImageUrl } from '../../../utils/product-image';

interface PaymentFormModel {
    cardNumber: string;
    expirationMonth: string;
    cvv: string;
    cardHolder: string;
}

@Component({
    selector: 'app-payment',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterLink],
    templateUrl: './payment.component.html',
    styleUrls: ['./payment.component.scss']
})
export class PaymentComponent implements OnInit {
    private readonly authService = inject(AuthService);
    private readonly cartService = inject(CartService);
    private readonly paymentService = inject(PaymentService);
    private readonly router = inject(Router);

    readonly cartItems$ = this.cartService.cartItems$;
    readonly cartItemsCount$ = this.cartService.getTotalItems();
    readonly subtotalAmount$ = this.cartService.getTotal();
    readonly shippingCost$ = this.cartService.getShippingCost();
    readonly totalAmount$ = this.cartService.getTotalWithShipping();

    readonly form: PaymentFormModel = {
        cardNumber: '',
        expirationMonth: '',
        cvv: '',
        cardHolder: ''
    };

    isSubmitting = false;
    paymentSuccessful = false;
    paidAmount = 0;
    errorMessage = '';

    ngOnInit(): void {
        if (!this.authService.isAuthenticated()) {
            this.router.navigate(['/login'], {
                queryParams: { returnUrl: '/checkout/payment' }
            });
            return;
        }

        this.cartService.loadCart();
    }

    getImageUrl(item: CartProduct): string {
        return buildProductImageUrl(item.product.name, item.product.image, item.product.id);
    }

    onCardNumberInput(value: string): void {
        const digits = value.replace(/\D/g, '').slice(0, 16);
        const groups = digits.match(/.{1,4}/g);
        this.form.cardNumber = groups ? groups.join(' ') : '';
    }

    onCvvInput(value: string): void {
        this.form.cvv = value.replace(/\D/g, '').slice(0, 3);
    }

    onExpirationInput(value: string): void {
        const digits = value.replace(/\D/g, '').slice(0, 4);
        if (!digits) {
            this.form.expirationMonth = '';
            return;
        }

        let month = digits.slice(0, 2);
        const year = digits.slice(2, 4);

        if (month.length === 2) {
            const normalizedMonth = Math.min(Math.max(Number(month) || 1, 1), 12);
            month = String(normalizedMonth).padStart(2, '0');
        }

        this.form.expirationMonth = year ? `${month}/${year}` : month;
    }

    async pay(): Promise<void> {
        if (this.isSubmitting) {
            return;
        }

        this.errorMessage = '';

        const totalItems = await firstValueFrom(this.cartItemsCount$);
        if (totalItems <= 0) {
            this.errorMessage = 'Tu carrito esta vacio. Anade productos antes de pagar.';
            return;
        }

        const totalAmount = await firstValueFrom(this.totalAmount$);
        if (!Number.isFinite(totalAmount) || totalAmount <= 0) {
            this.errorMessage = 'El total del carrito no es valido.';
            return;
        }

        const normalizedExpiration = this.normalizeExpirationForBackend(this.form.expirationMonth);
        if (!normalizedExpiration) {
            this.errorMessage = 'La fecha de caducidad no es valida o la tarjeta esta caducada.';
            return;
        }

        const userId = this.authService.getUserId();
        if (!userId) {
            this.router.navigate(['/login'], {
                queryParams: { returnUrl: '/checkout/payment' }
            });
            return;
        }

        this.isSubmitting = true;

        try {
            const paymentRequest = this.buildPaymentRequest(userId, normalizedExpiration);
            const paymentResponse = await firstValueFrom(this.paymentService.pay(paymentRequest));
            this.cartService.loadCart();

            this.paidAmount = Number(paymentResponse.amount.toFixed(2));
            this.paymentSuccessful = true;
        } catch (error) {
            this.errorMessage = this.getErrorMessage(error);
        } finally {
            this.isSubmitting = false;
        }
    }

    private buildPaymentRequest(userId: string, expirationMonth: string): CheckoutPaymentRequest {
        return {
            userId,
            cardNumber: this.form.cardNumber,
            expirationMonth,
            cvv: this.form.cvv,
            cardHolder: this.form.cardHolder.trim()
        };
    }

    private normalizeExpirationForBackend(expiration: string): string | null {
        const match = expiration.match(/^(0[1-9]|1[0-2])\/(\d{2})$/);
        if (!match) {
            return null;
        }

        const month = Number(match[1]);
        const year = 2000 + Number(match[2]);

        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth() + 1;
        if (year < currentYear || (year === currentYear && month < currentMonth)) {
            return null;
        }

        return `${year}-${String(month).padStart(2, '0')}`;
    }

    private getErrorMessage(error: unknown): string {
        if (error instanceof HttpErrorResponse) {
            if (error.status === 0) {
                return 'No se pudo conectar con el backend de la tienda.';
            }

            const backendMessage = this.getBackendErrorMessage(error.error);
            if (backendMessage) {
                return backendMessage;
            }

            return `No se pudo completar el pago (HTTP ${error.status}).`;
        }

        if (error instanceof Error) {
            return error.message;
        }

        return 'No se pudo completar el pago. Intentalo de nuevo.';
    }

    private getBackendErrorMessage(errorBody: unknown): string | null {
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

            const details = body['details'];
            if (Array.isArray(details)) {
                const messages = details.filter((item): item is string => typeof item === 'string');
                if (messages.length > 0) {
                    return messages.join('. ');
                }
            }
        }

        return null;
    }
}
