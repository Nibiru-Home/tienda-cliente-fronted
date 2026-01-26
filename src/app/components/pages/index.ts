import { Component } from '@angular/core';
import { BentoGalleryComponent } from '../../transitions/features/components/bento-gallery/bento-gallery.component';

@Component({
  selector: 'app-index-page',
  standalone: true,
  imports: [BentoGalleryComponent],
  templateUrl: './index.html',
  styleUrl: './index.scss'
})
export class IndexPage {}
