import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { BentoGalleryComponent } from '../../../transitions/features/components/bento-gallery/bento-gallery';
import { IndexCardsComponent } from '../../ui/c-index-cards/c-index-cards';
import { ArmarioGsapComponent } from '../../../transitions/features/components/armario-gsap/armario-gsap';
import { StoryCardComponent } from '../../ui/c-story-card/c-story-card';
import { LayoutFooterComponent } from '../../layout/footer/footer';
import { InspirationCardComponent } from '../../ui/c-inspiration-card/c-inspiration-card';
import { ProductService } from '../../../services/product.service';
import { Product } from '../../../models/product.model';

@Component({
  selector: 'app-index-page',
  standalone: true,
  imports: [
    BentoGalleryComponent,
    IndexCardsComponent,
    ArmarioGsapComponent,
    StoryCardComponent,
    LayoutFooterComponent,
    InspirationCardComponent
  ],
  templateUrl: './index.html',
  styleUrl: './index.scss'
})
export class IndexPage implements OnInit {
  productService = inject(ProductService);
  cd = inject(ChangeDetectorRef);
  products: Product[] = [];

  ngOnInit() {
    this.productService.getAllProducts().subscribe({
      next: (data) => {
        this.products = data.slice(0, 4);
        this.cd.markForCheck();
      },
      error: (err) => console.error('Error fetching products:', err)
    });
  }
}
