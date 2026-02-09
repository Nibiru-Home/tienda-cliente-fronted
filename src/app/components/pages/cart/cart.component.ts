import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CartService } from '../../../services/cart.service';
import { CartProduct } from '../../../models/cart.model';
import { buildProductImageUrl } from '../../../utils/product-image';
import { AuthService } from '../../../services/auth.service';

@Component({
    selector: 'app-cart',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './cart.component.html',
    styleUrls: ['./cart.component.scss']
})
export class CartComponent {
    private cartService = inject(CartService);
    private authService = inject(AuthService);
    private router = inject(Router);

    cartItems$ = this.cartService.cartItems$;
    totalAmount$ = this.cartService.getTotal();

    getImageUrl(item: CartProduct): string {
        return buildProductImageUrl(item.product.name, item.product.image, item.product.id);
    }

    increaseQuantity(item: CartProduct): void {
        this.cartService.updateQuantity(item.id, item.quantity + 1, item.cart.id, item.product.id);
    }

    decreaseQuantity(item: CartProduct): void {
        if (item.quantity > 1) {
            this.cartService.updateQuantity(item.id, item.quantity - 1, item.cart.id, item.product.id);
        } else {
            this.removeItem(item.id);
        }
    }

    removeItem(id: number): void {
        this.cartService.removeFromCart(id);
    }

    continueToPayment(): void {
        if (!this.authService.isAuthenticated()) {
            this.router.navigate(['/login'], {
                queryParams: { returnUrl: '/checkout/payment' }
            });
            return;
        }

        this.router.navigate(['/checkout/payment']);
    }
}
