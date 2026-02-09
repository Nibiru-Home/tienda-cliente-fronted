import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, timeout } from 'rxjs/operators';
import { HTTPService } from './http.service';

export interface CheckoutPaymentRequest {
    userId: string;
    cardNumber: string;
    expirationMonth: string;
    cvv: string;
    cardHolder: string;
}

export interface CheckoutPaymentResponse {
    message: string;
    amount: number;
}

@Injectable({
    providedIn: 'root'
})
export class PaymentService {
    constructor(private readonly http: HTTPService) { }

    pay(request: CheckoutPaymentRequest): Observable<CheckoutPaymentResponse> {
        return this.http.post<CheckoutPaymentResponse>('/api/payments/checkout', request).pipe(
            timeout(15000),
            catchError((error) => {
                if (error?.name === 'TimeoutError') {
                    return throwError(() => new Error('El pago esta tardando demasiado. Intentalo de nuevo.'));
                }
                return throwError(() => error);
            })
        );
    }
}
