import { Injectable } from '@angular/core';
import { BehaviorSubject, EMPTY, Observable, forkJoin, of, throwError } from 'rxjs';
import { catchError, finalize, map, switchMap, tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { Product } from '../models/product.model';
import { HTTPService } from './http.service';
import { AuthService } from './auth.service';
import { Cart } from '../models/cart.model';

@Injectable({
    providedIn: 'root'
})
export class CartService {
    readonly freeShippingThreshold = 80;
    readonly shippingFee = 6.99;
    private readonly addingProductIds = new Set<number>();

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

    hasProductInCart(productId: number): boolean {
        if (!productId) {
            return false;
        }
        return (this.cartSubject.value?.items ?? []).some((item) => item.product.id === productId);
    }

    addToCart(product: Product): void {
        if (!product?.id) {
            return;
        }

        if (this.addingProductIds.has(product.id)) {
            return;
        }

        if (!this.getUserId()) {
            this.redirectToLoginIfNeeded();
            return;
        }

        if (this.hasProductInCart(product.id)) {
            return;
        }

        this.addingProductIds.add(product.id);

        this.ensureActiveCart().pipe(
            switchMap((cart) => {
                if (!cart) {
                    return EMPTY;
                }

                const existingItem = (cart.items ?? []).find((item) => item.product.id === product.id);

                if (existingItem) {
                    return of(null);
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
            }),
            finalize(() => {
                this.addingProductIds.delete(product.id);
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
            next: () => this.loadCart(),
            error: (err) => console.error('Error updating quantity', err)
        });
    }

    clearCart(): Observable<void> {
        return this.ensureActiveCart().pipe(
            switchMap((cart) => {
                const items = cart?.items ?? [];
                if (items.length === 0) {
                    return of(void 0);
                }

                const deleteRequests = items.map((item) => this.http.delete<void>(`/api/cart-products/${item.id}`));
                return forkJoin(deleteRequests).pipe(
                    switchMap(() => this.fetchActiveCart()),
                    map(() => void 0)
                );
            }),
            catchError((err) => {
                console.error('Error clearing cart', err);
                return throwError(() => err);
            })
        );
    }

    getTotal(): Observable<number> {
        return this.cart$.pipe(
            map((cart) => (cart?.items ?? []).reduce((acc, item) => acc + (item.product.price * item.quantity), 0))
        );
    }

    getShippingCost(): Observable<number> {
        return this.getTotal().pipe(
            map((subtotal) => (subtotal > 0 && subtotal < this.freeShippingThreshold ? this.shippingFee : 0))
        );
    }

    getTotalWithShipping(): Observable<number> {
        return this.getTotal().pipe(
            map((subtotal) => {
                const shipping = subtotal > 0 && subtotal < this.freeShippingThreshold ? this.shippingFee : 0;
                return Number((subtotal + shipping).toFixed(2));
            })
        );
    }

    getTotalItems(): Observable<number> {
        return this.cart$.pipe(
            map((cart) => (cart?.items ?? []).reduce((acc, item) => acc + item.quantity, 0))
        );
    }
}
