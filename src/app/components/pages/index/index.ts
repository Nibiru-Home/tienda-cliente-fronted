import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BentoGalleryComponent } from '../../../transitions/features/components/bento-gallery/bento-gallery';
import { IndexCardsComponent } from '../../ui/c-index-cards/c-index-cards';
import { ArmarioGsapComponent } from '../../../transitions/features/components/armario-gsap/armario-gsap';
import { StoryCardComponent } from '../../ui/c-story-card/c-story-card';
import { LayoutFooterComponent } from '../../layout/footer/footer';
import { InspirationCardComponent } from '../../ui/c-inspiration-card/c-inspiration-card';
import { ProductService } from '../../../services/product.service';
import { CategoryService } from '../../../services/category.service';
import { Product, Category } from '../../../models/product.model';
import { buildProductImageUrl } from '../../../utils/product-image';

interface CategoryCard {
  name: string;
  image: string;
}

@Component({
  selector: 'app-index-page',
  standalone: true,
  imports: [
    BentoGalleryComponent,
    IndexCardsComponent,
    ArmarioGsapComponent,
    StoryCardComponent,
    LayoutFooterComponent,
    InspirationCardComponent,
    RouterLink
  ],
  templateUrl: './index.html',
  styleUrl: './index.scss'
})
export class IndexPage implements OnInit {
  productService = inject(ProductService);
  categoryService = inject(CategoryService);
  cd = inject(ChangeDetectorRef);
  products: Product[] = [];
  categoryCards: CategoryCard[] = [];

  private readonly fallbackCategoryNames = [
    'Muebles',
    'Iluminacion',
    'Decoracion',
    'Textiles',
    'Organizadores',
    'Aromas',
    'Bebes',
    'Exterior'
  ];

  private readonly categoryImageMap: Record<string, string> = {
    muebles: '/images/gsap/imagencentro.jpeg',
    iluminacion: '/images/gsap/iluminacionBoton.jpeg',
    decoracion: '/images/gsap/decoracionBoton.jpeg',
    textiles: '/images/gsap/textil.png',
    organizadores: '/images/gsap/organizadores.png',
    aromas: '/images/gsap/aromas.png',
    bebes: '/images/gsap/bebes.png',
    exterior: '/images/gsap/exterior.png'
  };

  productImageUrl(product: Product): string {
    return buildProductImageUrl(product?.name, product?.image, product?.id);
  }

  ngOnInit() {
    this.categoryCards = this.buildCategoryCardsFromNames(this.fallbackCategoryNames);

    this.categoryService.getAllCategories().subscribe({
      next: (data) => {
        this.categoryCards = this.buildCategoryCards(data ?? []);
        this.cd.markForCheck();
      },
      error: (err) => console.error('Error fetching categories:', err)
    });

    this.productService.getAllProducts().subscribe({
      next: (data) => {
        this.products = data.slice(0, 4);
        this.cd.markForCheck();
      },
      error: (err) => console.error('Error fetching products:', err)
    });
  }

  private buildCategoryCards(categories: Category[]): CategoryCard[] {
    const names = (categories ?? []).map((category) => category?.name ?? '');
    return this.buildCategoryCardsFromNames(names);
  }

  private buildCategoryCardsFromNames(names: string[]): CategoryCard[] {
    const cards: CategoryCard[] = [];
    const seen = new Set<string>();

    for (const rawName of names) {
      const name = String(rawName ?? '').trim();
      if (!name) {
        continue;
      }

      const key = this.normalizeKey(name);
      if (seen.has(key)) {
        continue;
      }

      seen.add(key);
      cards.push({
        name,
        image: this.resolveCategoryImage(name)
      });
    }

    return cards;
  }

  private resolveCategoryImage(name: string): string {
    const key = this.normalizeKey(name);
    return this.categoryImageMap[key] ?? this.categoryImageMap['muebles'];
  }

  private normalizeKey(value: string): string {
    return value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim()
      .toLowerCase();
  }
}
