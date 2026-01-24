import { Component } from '@angular/core';
import { BentoGalleryComponent } from '../components/bento-gallery/bento-gallery.component';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [BentoGalleryComponent],
  template: `
    <app-bento-gallery />
  `
})
export class HomePage {}
