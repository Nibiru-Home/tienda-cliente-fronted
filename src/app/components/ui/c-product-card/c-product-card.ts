import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Product } from '../../../models/product.model';
import { buildProductImageUrl } from '../../../utils/product-image';

@Component({
    selector: 'app-product-card',
    standalone: true,
    imports: [CommonModule, RouterLink],
    templateUrl: './c-product-card.html',
    styleUrls: ['./c-product-card.scss']
})
export class ProductCardComponent {
    @Input({ required: true }) product!: Product;
    @Output() view = new EventEmitter<number>();
    @Output() edit = new EventEmitter<number>();
    @Output() delete = new EventEmitter<number>();

    get imageUrl(): string {
        return buildProductImageUrl(this.product?.name, this.product?.image, this.product?.id);
    }

    onView() {
        this.view.emit(this.product.id);
    }
}
