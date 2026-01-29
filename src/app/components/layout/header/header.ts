import { Component, ElementRef, HostListener, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common'; // Import CommonModule
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { AuthService } from '../../../services/auth.service'; // Import AuthService
import { HeaderMenuComponent, HeaderMenuItem } from '../../ui/c-header-menu/c-header-menu';

@Component({
  selector: 'app-layout-header',
  standalone: true,
  imports: [RouterLink, CommonModule, HeaderMenuComponent], // Add CommonModule to imports
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class LayoutHeaderComponent {
  private readonly router = inject(Router);
  private readonly elementRef = inject(ElementRef<HTMLElement>);
  readonly authService = inject(AuthService); // Inject AuthService and make it public for template
  showCategories = false;
  showEstancias = false;
  readonly productMenu: HeaderMenuItem[] = [
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
  readonly estanciasMenu: HeaderMenuItem[] = [
    { label: 'Cocina' },
    { label: 'Dormitorio' },
    { label: 'Salon' },
    { label: 'Baño' }
  ];

  constructor() {
    gsap.registerPlugin(ScrollTrigger);
  }

  onHomeClick(event: MouseEvent): void {
    event.preventDefault();
    this.showCategories = false;
    this.showEstancias = false;

    const navigatePromise =
      this.router.url === '/' ? Promise.resolve(true) : this.router.navigate(['/']);

    navigatePromise.then(() => {
      this.scrollToBentoEnd();
    });
  }

  logout(): void {
    this.showCategories = false;
    this.showEstancias = false;
    this.authService.logout();
    this.router.navigate(['/']).then(() => {
      window.scrollTo(0, 0); // Reset scroll position
      setTimeout(() => {
        ScrollTrigger.refresh(); // Force GSAP to recalculate positions
      }, 100);
    });
  }

  onProductsClick(): void {
    this.showEstancias = false;
    this.showCategories = !this.showCategories;
  }

  closeCategories(): void {
    this.showCategories = false;
    this.showEstancias = false;
  }

  onProductMenuSelect(item: HeaderMenuItem): void {
    if (item.route) {
      this.router.navigate([item.route], { queryParams: item.queryParams ?? {} });
    }
    this.closeCategories();
  }

  onEstanciasMenuSelect(): void {
    this.closeCategories();
  }

  onEstanciasClick(): void {
    this.showCategories = false;
    this.showEstancias = !this.showEstancias;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.showCategories && !this.showEstancias) {
      return;
    }

    const target = event.target as Node | null;
    if (!target) {
      return;
    }

    if (!this.elementRef.nativeElement.contains(target)) {
      this.showCategories = false;
      this.showEstancias = false;
    }
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
}
