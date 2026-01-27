import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { Product } from '../../../models/product.model';
import { ProductService } from '../../../services/product.service';
import { ProductCardComponent } from '../../ui/c-product-card/c-product-card';
import { CPagination } from '../../ui/c-pagination/c-pagination';
import { LayoutFooterComponent } from '../../layout/footer/footer';

@Component({
    selector: 'app-product-list',
    standalone: true,
    imports: [CommonModule, ProductCardComponent, CPagination, LayoutFooterComponent],
    templateUrl: './product-list.component.html',
    styleUrls: ['./product-list.component.scss']
})
export class ProductListComponent implements OnInit {
    products: Product[] = [];
    private allProducts: Product[] = [];
    currentPage = 1;
    pageSize = 12;
    totalPages = 1;
    paginationRoute = '/products';

    constructor(
        private productService: ProductService,
        private cd: ChangeDetectorRef,
        private route: ActivatedRoute
    ) { }

    ngOnInit(): void {
        this.route.queryParamMap.subscribe((params) => {
            const pageParam = Number(params.get('page'));
            const sizeParam = Number(params.get('size'));

            this.currentPage = Number.isFinite(pageParam) && pageParam > 0 ? pageParam : 1;
            this.pageSize = Number.isFinite(sizeParam) && sizeParam > 0 ? sizeParam : 12;
            this.applyPagination();
        });

        this.productService.getAllProducts().subscribe({
            next: (data) => {
                console.log('Productos recibidos del backend:', data);
                this.allProducts = data ?? [];
                this.applyPagination();
                this.cd.detectChanges();
            },
            error: (err) => {
                console.error('Error al obtener productos:', err);
            }
        });
    }

    private applyPagination(): void {
        if (!this.allProducts.length) {
            this.products = [];
            this.totalPages = 1;
            return;
        }

        this.totalPages = Math.max(1, Math.ceil(this.allProducts.length / this.pageSize));
        this.currentPage = Math.min(Math.max(this.currentPage, 1), this.totalPages);
        const start = (this.currentPage - 1) * this.pageSize;
        this.products = this.allProducts.slice(start, start + this.pageSize);
    }
}
