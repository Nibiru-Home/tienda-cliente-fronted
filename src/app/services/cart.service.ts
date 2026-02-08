import { Injectable } from '@angular/core';
import { BehaviorSubject, EMPTY, Observable, of } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { Product } from '../models/product.model';
import { HTTPService } from './http.service';
import { AuthService } from './auth.service';
import { Cart } from '../models/cart.model';

@Injectable({
    providedIn: 'root'
})
export class CartService {
    private cartSubject = new BehaviorSubject<Cart | null>(null);
    cart$ = this.cartSubject.asObservable();

    cartItems$ = this.cartSubject.pipe(map(cart => cart?.items ?? []));

    constructor(
        private http: HTTPService,
        private authService: AuthService,
        private router: Router
    ) {
        this.loadCart();
    }

    private getUserId(): string | null {
        return this.authService.getUserId();
    }

    private normalizeCart(cart: Cart): Cart {
        return {
            ...cart,
            items: cart.items ?? []
        };
    }

    private fetchActiveCart(): Observable<Cart | null> {
        const userId = this.getUserId();
        if (!userId) {
            this.cartSubject.next(null);
            return of(null);
        }

        return this.http.get<Cart>(`/api/carts/active?userId=${userId}`).pipe(
            map((cart) => this.normalizeCart(cart)),
            tap((cart) => this.cartSubject.next(cart)),
            catchError((err) => {
                console.error('Error loading cart', err);
                return of(null);
            })
        );
    }

    private ensureActiveCart(): Observable<Cart | null> {
        const cart = this.cartSubject.value;
        if (cart) {
            return of(this.normalizeCart(cart));
        }
        return this.fetchActiveCart();
    }

    private redirectToLoginIfNeeded(): void {
        if (!this.authService.isAuthenticated()) {
            const returnUrl = this.router.url;
            if (returnUrl.startsWith('/login')) {
                return;
            }
            this.router.navigate(['/login'], {
                queryParams: { returnUrl }
            });
        }
    }

    loadCart(): void {
        this.fetchActiveCart().subscribe();
    }

    addToCart(product: Product): void {
        if (!product?.id) {
            return;
        }

        if (!this.getUserId()) {
            this.redirectToLoginIfNeeded();
            return;
        }

        this.ensureActiveCart().pipe(
            switchMap((cart) => {
                if (!cart) {
                    return EMPTY;
                }

                const existingItem = (cart.items ?? []).find((item) => item.product.id === product.id);

                if (existingItem) {
                    const body = {
                        id: existingItem.id,
                        quantity: existingItem.quantity + 1,
                        cart: { id: existingItem.cart.id },
                        product: { id: existingItem.product.id }
                    };
                    return this.http.put(`/api/cart-products/${existingItem.id}`, body);
                }

                const body = {
                    quantity: 1,
                    cart: { id: cart.id },
                    product: { id: product.id }
                };
                return this.http.post('/api/cart-products', body);
            }),
            switchMap(() => this.fetchActiveCart()),
            catchError((err) => {
                console.error('Error adding to cart', err);
                return EMPTY;
            })
        ).subscribe();
    }

    removeFromCart(cartProductId: number): void {
        this.http.delete(`/api/cart-products/${cartProductId}`).subscribe({
            next: () => this.loadCart(),
            error: (err) => console.error('Error removing from cart', err)
        });
    }

    updateQuantity(cartProductId: number, quantity: number, cartId: number, productId: number): void {
        if (quantity <= 0) {
            this.removeFromCart(cartProductId);
            return;
        }

        const body = {
            id: cartProductId,
            quantity: quantity,
            cart: { id: cartId },
            product: { id: productId }
        };

        this.http.put<any>(`/api/cart-products/${cartProductId}`, body).subscribe({
            next: () => this.loadCart(), // Reload to get updated totals
            error: (err) => console.error('Error updating quantity', err)
        });
    }

    getTotal(): Observable<number> {
        return this.cart$.pipe(
            map((cart) => (cart?.items ?? []).reduce((acc, item) => acc + (item.product.price * item.quantity), 0))
        );
    }

    getTotalItems(): Observable<number> {
        return this.cart$.pipe(
            map((cart) => (cart?.items ?? []).reduce((acc, item) => acc + item.quantity, 0))
        );
    }
}
