import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Product } from '../../../models/product.model';

@Component({
    selector: 'app-product-card',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './c-product-card.html',
    styleUrls: ['./c-product-card.scss']
})
export class ProductCardComponent {
    @Input({ required: true }) product!: Product;
    @Output() view = new EventEmitter<number>();
    @Output() edit = new EventEmitter<number>();
    @Output() delete = new EventEmitter<number>();

    private readonly baseUrl = 'images/products/';

    get imageUrl(): string {
        if (!this.product.image) {
            return 'assets/images/error-404.svg';
        }
        if (this.product.image.startsWith('http') || this.product.image.startsWith('/') || this.product.image.startsWith('assets')) {
            return this.product.image;
        }
        return `${this.baseUrl}${this.product.image}`;
    }

    onView() {
        this.view.emit(this.product.id);
    }
}
