import { Component } from '@angular/core';
import { BentoGalleryComponent } from '../../transitions/features/components/bento-gallery/bento-gallery.component';
import { IndexCardsComponent } from '../ui/index-cards/index-cards.component';

@Component({
  selector: 'app-index-page',
  standalone: true,
  imports: [BentoGalleryComponent, IndexCardsComponent],
  templateUrl: './index.html',
  styleUrl: './index.scss'
})
export class IndexPage {}
