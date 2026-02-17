import { Component, ElementRef, HostListener, OnInit, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { AuthService } from '../../../services/auth.service';
import { CartService } from '../../../services/cart.service';
import { CategoryService } from '../../../services/category.service';

interface HeaderMenuItem {
  label: string;
  route?: string;
  queryParams?: Record<string, string | number | boolean>;
}

@Component({
  selector: 'app-layout-header',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class LayoutHeaderComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly elementRef = inject(ElementRef<HTMLElement>);
  private readonly categoryService = inject(CategoryService);
  private readonly cartService = inject(CartService);
  readonly authService = inject(AuthService);
  readonly cartItemsCount$ = this.cartService.getTotalItems();
  showCategories = false;
  showEstancias = false;
  showUserMenu = false;

  private readonly fallbackProductMenu: HeaderMenuItem[] = [
    { label: 'Ver todos', route: '/products' },
    { label: 'Muebles', route: '/products', queryParams: { category: 'Muebles', page: 1 } },
    { label: 'Iluminación', route: '/products', queryParams: { category: 'Iluminacion', page: 1 } },
    { label: 'Decoración', route: '/products', queryParams: { category: 'Decoracion', page: 1 } },
    { label: 'Textiles', route: '/products', queryParams: { category: 'Textiles', page: 1 } },
    { label: 'Organizadores', route: '/products', queryParams: { category: 'Organizadores', page: 1 } },
    { label: 'Aromas', route: '/products', queryParams: { category: 'Aromas', page: 1 } },
    { label: 'Bebes', route: '/products', queryParams: { category: 'Bebes', page: 1 } },
    { label: 'Exterior', route: '/products', queryParams: { category: 'Exterior', page: 1 } }
  ];
  productMenu: HeaderMenuItem[] = [...this.fallbackProductMenu];
  readonly estanciasMenu: HeaderMenuItem[] = [
    { label: 'Cocina', route: '/products', queryParams: { room: 'cocina', page: 1 } },
    { label: 'Dormitorio', route: '/products', queryParams: { room: 'dormitorio', page: 1 } },
    { label: 'Salon', route: '/products', queryParams: { room: 'salon', page: 1 } },
    { label: 'Baño', route: '/products', queryParams: { room: 'bano', page: 1 } }
  ];

  constructor() {
    gsap.registerPlugin(ScrollTrigger);
  }

  ngOnInit(): void {
    this.loadCategories();
  }

  onHomeClick(event: MouseEvent): void {
    event.preventDefault();
    this.showCategories = false;
    this.showEstancias = false;
    this.showUserMenu = false;

    const navigatePromise =
      this.router.url === '/' ? Promise.resolve(true) : this.router.navigate(['/']);

    navigatePromise.then(() => {
      this.scrollToBentoEnd();
    });
  }

  logout(): void {
    this.showCategories = false;
    this.showEstancias = false;
    this.showUserMenu = false;
    this.authService.logout();
    this.router.navigate(['/']).then(() => {
      window.scrollTo(0, 0);
      setTimeout(() => {
        ScrollTrigger.refresh();
      }, 100);
    });
  }

  onProductsClick(): void {
    this.showEstancias = false;
    this.showUserMenu = false;
    this.showCategories = !this.showCategories;
  }

  closeCategories(): void {
    this.showCategories = false;
    this.showEstancias = false;
    this.showUserMenu = false;
  }

  onProductMenuSelect(item: HeaderMenuItem): void {
    if (item.route) {
      this.router.navigate([item.route], { queryParams: item.queryParams ?? {} });
    }
    this.closeCategories();
  }

  onEstanciasMenuSelect(item: HeaderMenuItem): void {
    if (item.route) {
      this.router.navigate([item.route], { queryParams: item.queryParams ?? {} });
    }
    this.closeCategories();
  }

  onEstanciasClick(): void {
    this.showCategories = false;
    this.showUserMenu = false;
    this.showEstancias = !this.showEstancias;
  }

  toggleUserMenu(event: MouseEvent): void {
    event.stopPropagation();
    this.showCategories = false;
    this.showEstancias = false;
    this.showUserMenu = !this.showUserMenu;
  }

  goToProfile(): void {
    this.showUserMenu = false;
    this.router.navigate(['/profile']);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.showCategories && !this.showEstancias && !this.showUserMenu) {
      return;
    }

    const target = event.target as Node | null;
    if (!target) {
      return;
    }

    if (!this.elementRef.nativeElement.contains(target)) {
      this.showCategories = false;
      this.showEstancias = false;
      this.showUserMenu = false;
    }
  }

  private loadCategories(): void {
    this.categoryService.getAllCategories().subscribe({
      next: (categories) => {
        const items = (categories ?? [])
          .map((category) => ({
            name: (category?.name ?? '').trim()
          }))
          .filter((category) => category.name);

        this.productMenu = [
          { label: 'Ver todos', route: '/products' },
          ...items.map((category) => ({
            label: category.name,
            route: '/products',
            queryParams: { category: category.name, page: 1 }
          }))
        ];
      },
      error: (err) => {
        console.error('Error fetching categories', err);
      }
    });
  }

  private scrollToBentoEnd(attempt = 0): void {
    const triggerElement = document.querySelector<HTMLElement>('#gallery-8');
    const trigger =
      triggerElement &&
      ScrollTrigger.getAll().find((item) => item.trigger === triggerElement);

    if (trigger) {
      window.scrollTo({ top: trigger.end, behavior: 'smooth' });
      return;
    }

    if (attempt < 20) {
      window.setTimeout(() => this.scrollToBentoEnd(attempt + 1), 100);
      return;
    }


    const fallback = document.querySelector('#gallery-end');
    if (fallback) {
      fallback.scrollIntoView({ behavior: 'smooth' });
    }
  }

  getUserInitial(): string {
    const name = this.authService.getUserName();
    return name ? name.charAt(0).toUpperCase() : '';
  }
}
