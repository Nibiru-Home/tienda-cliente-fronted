import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-inspiration-card',
  standalone: true,
  templateUrl: './inspiration-card.component.html',
  styleUrl: './inspiration-card.component.scss'
})
export class InspirationCardComponent {
  @Input() title = '';
  @Input() description = '';
  @Input() imageSrc = '';
  @Input() alt = '';
  @Input() href = '#';
}
