import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ProductService } from '../../../services/product.service';
import { Product, Category } from '../../../models/product.model';
import { buildProductImageUrl, buildProductImageVariants } from '../../../utils/product-image';

@Component({
  selector: 'app-product-detail-page',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './product-detail.html',
  styleUrl: './product-detail.scss'
})
export class ProductDetailPage implements OnInit {
  private route = inject(ActivatedRoute);
  private productService = inject(ProductService);
  private cd = inject(ChangeDetectorRef);

  product: Product = {
    id: 0,
    name: '',
    description: '',
    price: 0,
    stock: 0,
    image: '',
    images: [],
    category: [],
    styles: []
  };
  relatedProducts: Product[] = [];
  private allProducts: Product[] = [];

  get displayImages(): string[] {
    if (this.product?.images?.length) {
      return this.product.images;
    }

    if (this.product?.id) {
      return buildProductImageVariants(this.product.id);
    }

    return [];
  }

  productImageUrl(product: Product, image?: string): string {
    const fallbackImage = image ?? product?.image ?? (product?.id ? buildProductImageVariants(product.id)[0] : undefined);
    return buildProductImageUrl(product?.name, fallbackImage, product?.id);
  }

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const idStr = params.get('id');
      const id = Number(idStr);
      console.log('ProductDetail: ID obtained from URL:', idStr, 'Parsed:', id);

      if (id) {
        this.fetchProduct(id);
      } else {
        console.error('ProductDetail: Invalid ID');
      }
    });

    this.loadAllProducts();
  }

  fetchProduct(id: number) {
    console.log('ProductDetail: Fetching product from service...', id);
    this.productService.getProductById(id).subscribe({
      next: (data) => {
        console.log('ProductDetail: Data received:', data);
        this.product = data;
        this.updateRelatedProducts();
        this.cd.markForCheck(); 
      },
      
    });
  }

  private loadAllProducts() {
    this.productService.getAllProducts().subscribe({
      next: (data) => {
        this.allProducts = data ?? [];
        this.updateRelatedProducts();
        this.cd.markForCheck();
      },
      
    });
  }

  private updateRelatedProducts() {
   

    const currentCategories = this.product.category ?? [];
    if (!currentCategories.length) {
      this.relatedProducts = [];
      return;
    }

    const related = this.allProducts.filter((item) => {
      if (item.id === this.product.id) {
        return false;
      }
      return this.hasSharedCategory(item.category ?? [], currentCategories);
    });

    this.relatedProducts = [...related]
      .sort(() => Math.random() - 0.5)
      .slice(0, 4);
  }

  private hasSharedCategory(categories: Category[], currentCategories: Category[]) {
    return categories.some((category) =>
      currentCategories.some((current) =>
        (current.id && current.id === category.id) ||
        (current.name && current.name === category.name)
      )
    );
  }
}
