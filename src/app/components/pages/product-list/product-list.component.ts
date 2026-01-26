import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Product } from '../../../models/product.model';
import { ProductService } from '../../../services/product.service';
import { ProductCardComponent } from '../../ui/product-card/product-card.component';

@Component({
    selector: 'app-product-list',
    standalone: true,
    imports: [CommonModule, ProductCardComponent],
    templateUrl: './product-list.component.html',
    styleUrls: ['./product-list.component.scss']
})
export class ProductListComponent implements OnInit {
    products: Product[] = [];

    constructor(
        private productService: ProductService,
        private cd: ChangeDetectorRef
    ) { }

    ngOnInit(): void {
        this.productService.getAllProducts().subscribe({
            next: (data) => {
                console.log('Productos recibidos del backend:', data);
                this.products = data;
                this.cd.detectChanges();
            },
            error: (err) => {
                console.error('Error al obtener productos:', err);
            }
        });
    }
}
