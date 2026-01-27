import { Component } from '@angular/core';
import { InspirationCardComponent } from '../c-inspiration-card/c-inspiration-card';

@Component({
  selector: 'app-index-cards',
  standalone: true,
  imports: [InspirationCardComponent],
  templateUrl: './c-index-cards.html',
  styleUrl: './c-index-cards.scss'
})
export class IndexCardsComponent { }
