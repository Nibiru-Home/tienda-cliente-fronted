import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

@Component({
  selector: 'app-layout-header',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class LayoutHeaderComponent {
  private readonly router = inject(Router);

  constructor() {
    gsap.registerPlugin(ScrollTrigger);
  }

  onHomeClick(event: MouseEvent): void {
    event.preventDefault();

    const navigatePromise =
      this.router.url === '/' ? Promise.resolve(true) : this.router.navigate(['/']);

    navigatePromise.then(() => {
      this.scrollToBentoEnd();
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
}
