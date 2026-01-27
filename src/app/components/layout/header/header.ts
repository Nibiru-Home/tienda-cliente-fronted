import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common'; // Import CommonModule
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { AuthService } from '../../../services/auth.service'; // Import AuthService

@Component({
  selector: 'app-layout-header',
  standalone: true,
  imports: [RouterLink, CommonModule], // Add CommonModule to imports
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class LayoutHeaderComponent {
  private readonly router = inject(Router);
  readonly authService = inject(AuthService); // Inject AuthService and make it public for template

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

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']).then(() => {
      window.scrollTo(0, 0); // Reset scroll position
      setTimeout(() => {
        ScrollTrigger.refresh(); // Force GSAP to recalculate positions
      }, 100);
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
