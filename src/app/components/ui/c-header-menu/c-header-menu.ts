import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface HeaderMenuItem {
  label: string;
  route?: string;
  queryParams?: Record<string, string | number | boolean>;
}

@Component({
  selector: 'app-header-menu',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './c-header-menu.html',
  styleUrl: './c-header-menu.scss'
})
export class HeaderMenuComponent {
  @Input() menuId = '';
  @Input() open = false;
  @Input() items: HeaderMenuItem[] = [];
  @Input() paddingTop = '0.6rem';
  @Input() paddingBottom = '1rem';
  @Input() itemPadding = '0.35rem 0.85rem';
  @Output() select = new EventEmitter<HeaderMenuItem>();

  onItemClick(item: HeaderMenuItem, event: MouseEvent): void {
    event.preventDefault();
    this.select.emit(item);
  }
}
