import { Component } from '@angular/core';
import { BentoGalleryComponent } from '../../transitions/features/components/bento-gallery/bento-gallery.component';
import { IndexCardsComponent } from '../ui/index-cards/index-cards.component';
import { ArmarioGsapComponent } from '../../transitions/features/components/armario-gsap/armario-gsap.component';
import { StoryCardComponent } from '../ui/story-card/story-card.component';

@Component({
  selector: 'app-index-page',
  standalone: true,
  imports: [BentoGalleryComponent, IndexCardsComponent, ArmarioGsapComponent, StoryCardComponent],
  templateUrl: './index.html',
  styleUrl: './index.scss'
})
export class IndexPage {}
