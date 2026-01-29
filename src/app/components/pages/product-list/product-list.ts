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
    private selectedCategory = '';
    filteredTotal = 0;
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
            const categoryParam = params.get('category');

            this.currentPage = Number.isFinite(pageParam) && pageParam > 0 ? pageParam : 1;
            this.pageSize = Number.isFinite(sizeParam) && sizeParam > 0 ? sizeParam : 12;
            this.selectedCategory = categoryParam?.trim() ?? '';
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
            this.filteredTotal = 0;
            return;
        }

        const filteredProducts = this.filterProductsByCategory(this.allProducts, this.selectedCategory);
        this.filteredTotal = filteredProducts.length;

        this.totalPages = Math.max(1, Math.ceil(filteredProducts.length / this.pageSize));
        this.currentPage = Math.min(Math.max(this.currentPage, 1), this.totalPages);
        const start = (this.currentPage - 1) * this.pageSize;
        this.products = filteredProducts.slice(start, start + this.pageSize);
    }

    get categoryTitle(): string {
        return this.selectedCategory ? this.selectedCategory : 'Todos los productos';
    }

    get categoryChip(): string {
        return this.selectedCategory ? 'Categoría' : 'Catálogo';
    }

    get categorySubtitle(): string {
        if (this.selectedCategory) {
            return `Descubre lo mejor en ${this.selectedCategory.toLowerCase()}.`;
        }
        return 'Explora toda nuestra selección de productos para tu hogar.';
    }

    private filterProductsByCategory(products: Product[], category: string): Product[] {
        const normalizedFilter = this.normalizeCategory(category);
        if (!normalizedFilter) {
            return products;
        }

        return products.filter((product) =>
            (product.category ?? []).some((cat) => this.normalizeCategory(cat?.name) === normalizedFilter)
        );
    }

    private normalizeCategory(value?: string | null): string {
        if (!value) {
            return '';
        }

        return value
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .trim()
            .toLowerCase();
    }
}
