import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { catchError, switchMap, timeout } from 'rxjs/operators';
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

export interface CardFundsValidationRequest {
    cardNumber: string;
    expirationMonth: string;
    cvv: string;
    cardHolder: string;
    amount: number;
}

export interface CardFundsValidationResult {
    hasEnoughFunds: boolean;
    message?: string;
}

interface BankCreditCardResponse {
    id: number;
    number: string;
    expirationDate: string;
    cvv: number;
    name: string;
}

interface BankAccountResponse {
    balance: number | string;
}

@Injectable({
    providedIn: 'root'
})
export class PaymentService {
    private readonly bankApiBaseUrl = 'https://api.bank.nibiruhome.store';

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

    validateCardFunds(request: CardFundsValidationRequest): Observable<CardFundsValidationResult> {
        const cardNumber = this.normalizeCardNumber(request.cardNumber);
        const expirationMonth = (request.expirationMonth || '').trim();
        const cardHolder = this.normalizeCardHolder(request.cardHolder);
        const cvvDigits = this.normalizeCvv(request.cvv);
        const amount = Number(request.amount);

        if (!cardNumber || !expirationMonth || !cardHolder || !cvvDigits || !Number.isFinite(amount) || amount <= 0) {
            return of({
                hasEnoughFunds: false,
                message: 'Los datos de la tarjeta no son validos.'
            });
        }

        return this.http.get<BankCreditCardResponse[]>(`${this.bankApiBaseUrl}/api/credit-cards`).pipe(
            timeout(10000),
            catchError(() => of([])),
            switchMap((cards) => {
                const card = (cards ?? []).find((candidate) =>
                    this.matchesCard(candidate, cardNumber, expirationMonth, cvvDigits, cardHolder)
                );

                if (!card?.id) {
                    return of({
                        hasEnoughFunds: false,
                        message: 'No se pudo validar la tarjeta para comprobar el saldo.'
                    });
                }

                return this.http.get<BankAccountResponse>(`${this.bankApiBaseUrl}/api/bank-accounts/card/${card.id}`).pipe(
                    timeout(10000),
                    catchError(() => of(null)),
                    switchMap((account) => {
                        const balance = Number(account?.balance);
                        if (!Number.isFinite(balance)) {
                            return of({
                                hasEnoughFunds: false,
                                message: 'No se pudo comprobar el saldo de la tarjeta.'
                            });
                        }

                        if (balance < amount) {
                            return of({
                                hasEnoughFunds: false,
                                message: 'Saldo insuficiente en la tarjeta para completar el pago.'
                            });
                        }

                        return of({
                            hasEnoughFunds: true
                        });
                    })
                );
            }),
            catchError(() =>
                of({
                    hasEnoughFunds: false,
                    message: 'No se pudo comprobar el saldo de la tarjeta.'
                })
            )
        );
    }

    private normalizeCardNumber(value: string): string {
        const digits = (value || '').replace(/\D/g, '');
        if (digits.length !== 16) {
            return '';
        }
        return digits.replace(/(.{4})(?=.)/g, '$1 ').trim();
    }

    private normalizeCardHolder(value: string): string {
        return (value || '').trim().replace(/\s+/g, ' ').toLowerCase();
    }

    private normalizeCvv(value: string): string {
        const digits = (value || '').replace(/\D/g, '');
        return digits.length === 3 ? digits : '';
    }

    private matchesCard(
        card: BankCreditCardResponse,
        cardNumber: string,
        expirationMonth: string,
        cvvDigits: string,
        cardHolder: string
    ): boolean {
        if (!card) {
            return false;
        }

        const normalizedCardNumber = this.normalizeCardNumber(card.number);
        const sameNumber = normalizedCardNumber === cardNumber;
        const sameExpirationMonth = this.normalizeBankExpirationMonth(card.expirationDate) === expirationMonth;
        const sameCvv = String(card.cvv).padStart(3, '0') === cvvDigits;
        const sameHolder = this.normalizeCardHolder(card.name) === cardHolder;

        return sameNumber && sameExpirationMonth && sameCvv && sameHolder;
    }

    private normalizeBankExpirationMonth(value: string): string {
        const rawValue = (value || '').trim();
        if (!rawValue) {
            return '';
        }

        const yyyyMmMatch = rawValue.match(/^(\d{4})-(0[1-9]|1[0-2])(?:-\d{2})?$/);
        if (yyyyMmMatch) {
            return `${yyyyMmMatch[1]}-${yyyyMmMatch[2]}`;
        }

        const mmYyMatch = rawValue.match(/^(0[1-9]|1[0-2])\/(\d{2})$/);
        if (mmYyMatch) {
            return `20${mmYyMatch[2]}-${mmYyMatch[1]}`;
        }

        return '';
    }
}
