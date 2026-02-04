import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LayoutHeaderComponent } from './components/layout/header/header';
import { ChatWidgetComponent } from './components/ui/chat-widget/chat-widget';


@Component({
  selector: 'app-root',
  imports: [RouterOutlet, LayoutHeaderComponent, ChatWidgetComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('tienda-cliente-fronted');
}
