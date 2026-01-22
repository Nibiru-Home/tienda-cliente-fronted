import { AfterViewInit, Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { gsap } from 'gsap';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements AfterViewInit {
  protected readonly title = signal('tienda-cliente-fronted');

  ngAfterViewInit(): void {
    gsap.from('.content', { opacity: 0, y: 12, duration: 0.6, ease: 'power2.out' });
  }
}
