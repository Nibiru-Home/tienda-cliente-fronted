import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LayoutHeaderComponent } from './components/layout/header.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, LayoutHeaderComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('tienda-cliente-fronted');
}
