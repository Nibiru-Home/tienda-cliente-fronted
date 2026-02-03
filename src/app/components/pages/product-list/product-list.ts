import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Product } from '../../../models/product.model';
import { ProductService } from '../../../services/product.service';
import { ProductCardComponent } from '../../ui/c-product-card/c-product-card';
import { CPagination } from '../../ui/c-pagination/c-pagination';
import { LayoutFooterComponent } from '../../layout/footer/footer';
import { RoomFiltersComponent, FilterState } from '../../ui/room-filters/room-filters';

@Component({
    selector: 'app-product-list',
    standalone: true,
    imports: [CommonModule, ProductCardComponent, CPagination, LayoutFooterComponent, RoomFiltersComponent],
    templateUrl: './product-list.component.html',
    styleUrls: ['./product-list.component.scss']
})
export class ProductListComponent implements OnInit {
    products: Product[] = [];
    private allProducts: Product[] = [];
    private selectedCategory = '';
    selectedRoom = '';
    filteredTotal = 0;
    currentPage = 1;
    pageSize = 12;
    totalPages = 1;
    paginationRoute = '/products';

    // Filters
    selectedStyle = '';
    selectedBudget = '';
    selectedFilterCategory = '';

    constructor(
        private productService: ProductService,
        private cd: ChangeDetectorRef,
        private route: ActivatedRoute,
        private router: Router
    ) { }

    ngOnInit(): void {
        this.route.queryParamMap.subscribe((params) => {
            const pageParam = Number(params.get('page'));
            const sizeParam = Number(params.get('size'));
            const categoryParam = params.get('category');
            const roomParam = params.get('room');

            // New Filter Params
            const styleParam = params.get('style');
            const budgetParam = params.get('budget');
            const filterCategoryParam = params.get('filterCategory');

            this.currentPage = Number.isFinite(pageParam) && pageParam > 0 ? pageParam : 1;
            this.pageSize = Number.isFinite(sizeParam) && sizeParam > 0 ? sizeParam : 12;
            this.selectedCategory = categoryParam?.trim() ?? '';
            this.selectedRoom = roomParam?.trim() ?? '';

            // Initialize new filters
            this.selectedStyle = styleParam?.trim() ?? '';
            this.selectedBudget = budgetParam?.trim() ?? '';
            this.selectedFilterCategory = filterCategoryParam?.trim() ?? '';

            // We don't reset filters here anymore because we want them to persist from URL
            // this.resetFilters(); 

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

    onFilterChange(filters: FilterState) {
        this.selectedStyle = filters.style;
        this.selectedBudget = filters.budget;
        this.selectedFilterCategory = filters.category;

        // Update URL with new filters, resetting page to 1
        this.router.navigate([], {
            relativeTo: this.route,
            queryParams: {
                style: this.selectedStyle || null,
                budget: this.selectedBudget || null,
                filterCategory: this.selectedFilterCategory || null,
                page: 1
            },
            queryParamsHandling: 'merge'
        });
    }

    get shouldShowFilters(): boolean {
        return !!this.selectedRoom;
    }

    private resetFilters() {
        this.selectedStyle = '';
        this.selectedBudget = '';
        this.selectedFilterCategory = '';
    }

    private applyPagination(): void {
        if (!this.allProducts.length) {
            this.products = [];
            this.totalPages = 1;
            this.filteredTotal = 0;
            return;
        }

        // Apply Room Filter first
        let filtered = this.filterProductsByRoom(this.allProducts, this.selectedRoom);

        // Apply Main Category Filter (from URL)
        filtered = this.filterProductsByCategory(filtered, this.selectedCategory);

        // Apply Extra Filters (Style, Budget, Category)
        if (this.selectedStyle) {
            const normalizedStyle = this.normalizeFilter(this.selectedStyle);
            filtered = filtered.filter(p => (p.styles ?? []).some(s => this.normalizeFilter(s) === normalizedStyle));
        }

        if (this.selectedFilterCategory) {
            const normalizedCat = this.normalizeFilter(this.selectedFilterCategory);
            filtered = filtered.filter(p => (p.category ?? []).some(c => this.normalizeFilter(c.name) === normalizedCat));
        }

        if (this.selectedBudget) {
            filtered = filtered.filter(p => this.checkBudget(p.price, this.selectedBudget));
        }

        this.filteredTotal = filtered.length;

        this.totalPages = Math.max(1, Math.ceil(filtered.length / this.pageSize));
        this.currentPage = Math.min(Math.max(this.currentPage, 1), this.totalPages);
        const start = (this.currentPage - 1) * this.pageSize;
        this.products = filtered.slice(start, start + this.pageSize);
    }

    private checkBudget(price: number, budgetType: string): boolean {
        switch (budgetType) {
            case 'low': return price < 30;
            case 'medium': return price >= 30 && price <= 60;
            case 'high': return price > 60 && price <= 100;
            case 'premium': return price > 100;
            default: return true;
        }
    }

    get categoryTitle(): string {
        if (this.selectedCategory) {
            return this.selectedCategory;
        }
        if (this.selectedRoom) {
            return this.getRoomLabel();
        }
        return 'Todos los productos';
    }

    get categoryChip(): string {
        if (this.selectedCategory) {
            return 'Categoría';
        }
        if (this.selectedRoom) {
            return 'Estancia';
        }
        return 'Catálogo';
    }

    get categorySubtitle(): string {
        if (this.selectedCategory) {
            return `Descubre lo mejor en ${this.selectedCategory.toLowerCase()}.`;
        }
        if (this.selectedRoom) {
            return `Encuentra lo ideal para ${this.getRoomLabel().toLowerCase()}.`;
        }
        return 'Explora toda nuestra selección de productos para tu hogar.';
    }

    private filterProductsByCategory(products: Product[], category: string): Product[] {
        const normalizedFilter = this.normalizeFilter(category);
        if (!normalizedFilter) {
            return products;
        }

        return products.filter((product) =>
            (product.category ?? []).some((cat) => this.normalizeFilter(cat?.name) === normalizedFilter)
        );
    }

    private filterProductsByRoom(products: Product[], room: string): Product[] {
        const normalizedFilter = this.normalizeFilter(room);
        if (!normalizedFilter) {
            return products;
        }

        return products.filter((product) =>
            (product.rooms ?? []).some((roomName) => this.normalizeFilter(roomName) === normalizedFilter)
        );
    }

    private getRoomLabel(): string {
        const normalized = this.normalizeFilter(this.selectedRoom);
        if (!normalized) {
            return '';
        }

        const labels: Record<string, string> = {
            cocina: 'Cocina',
            dormitorio: 'Dormitorio',
            salon: 'Salón',
            bano: 'Baño'
        };

        return labels[normalized] ?? this.selectedRoom;
    }

    private normalizeFilter(value?: string | null): string {
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
