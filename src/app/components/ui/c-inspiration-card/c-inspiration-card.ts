
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-inspiration-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './c-inspiration-card.html',
  styleUrl: './c-inspiration-card.scss'
})
export class InspirationCardComponent {
  @Input() eyebrow = '';
  @Input() title = '';
  @Input() description = '';
  @Input() imageSrc = '';
  @Input() alt = '';
  @Input() href = '#';
}

