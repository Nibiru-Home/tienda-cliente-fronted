import { Component } from '@angular/core';
import { InspirationCardComponent } from '../inspiration-card/inspiration-card';

@Component({
  selector: 'app-index-cards',
  standalone: true,
  imports: [InspirationCardComponent],
  templateUrl: './index-cards.component.html',
  styleUrl: './index-cards.component.scss'
})
export class IndexCardsComponent {}
