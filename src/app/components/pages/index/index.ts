import { Component } from '@angular/core';
import { BentoGalleryComponent } from '../../../transitions/features/components/bento-gallery/bento-gallery';
import { IndexCardsComponent } from '../../ui/c-index-cards/c-index-cards';
import { ArmarioGsapComponent } from '../../../transitions/features/components/armario-gsap/armario-gsap';
import { StoryCardComponent } from '../../ui/c-story-card/c-story-card';
import { LayoutFooterComponent } from '../../layout/footer/footer';

@Component({
  selector: 'app-index-page',
  standalone: true,
  imports: [
    BentoGalleryComponent,
    IndexCardsComponent,
    ArmarioGsapComponent,
    StoryCardComponent,
    LayoutFooterComponent
  ],
  templateUrl: './index.html',
  styleUrl: './index.scss'
})
export class IndexPage { }
