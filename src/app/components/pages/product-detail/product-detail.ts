import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { ProductService } from '../../../services/product.service';
import { Product } from '../../../models/product.model';

@Component({
  selector: 'app-product-detail-page',
  standalone: true,
  imports: [CommonModule],
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
  }

  fetchProduct(id: number) {
    console.log('ProductDetail: Fetching product from service...', id);
    this.productService.getProductById(id).subscribe({
      next: (data) => {
        console.log('ProductDetail: Data received:', data);
        this.product = data;
        this.cd.markForCheck(); // Ensure view update
      },
      error: (err) => console.error('Error fetching product:', err)
    });
  }
}
