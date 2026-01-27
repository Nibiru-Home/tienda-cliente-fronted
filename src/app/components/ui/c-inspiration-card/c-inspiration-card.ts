import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-inspiration-card',
  standalone: true,
  templateUrl: './c-inspiration-card.html',
  styleUrl: './c-inspiration-card.scss'
})
export class InspirationCardComponent {
  @Input() title = '';
  @Input() description = '';
  @Input() imageSrc = '';
  @Input() alt = '';
  @Input() href = '#';
}
