import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import type { ChatMessage } from '../../../services/chat.service';

type StepId =
  | 'root'
  | 'recommend_room'
  | 'recommend_style'
  | 'recommend_budget'
  | 'recommend_category'
  | 'info_root'
  | 'catalog_category'
  | 'contact_phone';

type InputMode = 'none' | 'phone';

interface ChatOption {
  id: string;
  label: string;
  value?: string;
}

@Component({
  selector: 'app-chat-widget',
  imports: [FormsModule],
  templateUrl: './chat-widget.html',
  styleUrl: './chat-widget.scss'
})
export class ChatWidgetComponent {
  @ViewChild('scrollContainer') private scrollContainer?: ElementRef<HTMLDivElement>;

  isOpen = false;
  input = '';
  messages: ChatMessage[] = [];
  options: ChatOption[] = [];
  inputMode: InputMode = 'none';
  inputPlaceholder = 'Selecciona una opción';
  private currentStep: StepId = 'root';
  private recommendation = {
    room: '',
    style: '',
    budget: '',
    category: ''
  };

  constructor(private router: Router) {
    this.resetFlow();
  }

  toggleOpen(): void {
    this.isOpen = !this.isOpen;
    if (this.isOpen) {
      setTimeout(() => this.scrollToBottom(), 0);
    } else {
      this.input = '';
    }
  }

  close(): void {
    this.isOpen = false;
    this.input = '';
  }

  clear(): void {
    this.resetFlow();
  }

  onSubmit(event: Event): void {
    event.preventDefault();
    if (this.inputMode !== 'phone') {
      return;
    }
    this.sendPhone();
  }

  onInputKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      if (this.inputMode === 'phone') {
        this.sendPhone();
      }
    }
  }

  onOptionSelect(option: ChatOption): void {
    this.pushUserMessage(option.label);

    switch (this.currentStep) {
      case 'root':
        this.handleRootSelection(option.id);
        break;
      case 'recommend_room':
        this.recommendation.room = option.value ?? '';
        this.askRecommendationStyle();
        break;
      case 'recommend_style':
        this.recommendation.style = option.label;
        this.askRecommendationBudget();
        break;
      case 'recommend_budget':
        this.recommendation.budget = option.value ?? '';
        this.askRecommendationCategory();
        break;
      case 'recommend_category':
        this.recommendation.category = option.label;
        this.finishRecommendationFlow();
        break;
      case 'info_root':
        this.handleInfoSelection(option.id);
        break;
      case 'catalog_category':
        this.navigateToCategory(option.label);
        break;
      case 'contact_phone':
        if (option.id === 'root') {
          this.showRootOptions('¿En qué más puedo ayudarte?');
        }
        break;
      default:
        this.showRootOptions();
        break;
    }
  }

  get isInputEnabled(): boolean {
    return this.inputMode !== 'none';
  }

  private sendPhone(): void {
    const phone = this.input.trim();
    if (!phone) {
      return;
    }
    this.pushUserMessage(phone);
    this.input = '';
    this.showAssistantMessage('Perfecto, ya se pondrán en contacto contigo.');
    this.showRootOptions('Si quieres, puedo ayudarte con otra cosa.');
  }

  private scrollToBottom(): void {
    const container = this.scrollContainer?.nativeElement;
    if (!container) {
      return;
    }

    const scroll = () => {
      container.scrollTop = container.scrollHeight;
    };

    requestAnimationFrame(() => {
      scroll();
      requestAnimationFrame(scroll);
    });
  }

  private resetFlow(): void {
    this.messages = [];
    this.recommendation = { room: '', style: '', budget: '', category: '' };
    this.showRootOptions('Hola! Soy el asistente de Nibiru. Elige una opción para continuar.');
  }

  private showRootOptions(message?: string): void {
    this.currentStep = 'root';
    if (message) {
      this.showAssistantMessage(message);
    }
    this.options = [
      { id: 'recommendations', label: 'Quiero recomendaciones de decoración' },
      { id: 'info', label: 'Información sobre envíos y métodos de pago' },
      { id: 'catalog', label: 'Ver catálogo por categorías' },
      { id: 'contact', label: 'Contactar con un asistente' }
    ];
    this.setInputMode('none');
  }

  private handleRootSelection(id: string): void {
    switch (id) {
      case 'recommendations':
        this.askRecommendationRoom();
        break;
      case 'info':
        this.askInfoTopic();
        break;
      case 'catalog':
        this.askCatalogCategory();
        break;
      case 'contact':
        this.askContactPhone();
        break;
      default:
        this.showRootOptions();
        break;
    }
  }

  private askRecommendationRoom(): void {
    this.currentStep = 'recommend_room';
    this.showAssistantMessage('Perfecto. ¿Para qué estancia es?');
    this.options = [
      { id: 'room_cocina', label: 'Cocina', value: 'cocina' },
      { id: 'room_dormitorio', label: 'Dormitorio', value: 'dormitorio' },
      { id: 'room_salon', label: 'Salón', value: 'salon' },
      { id: 'room_bano', label: 'Baño', value: 'bano' }
    ];
    this.setInputMode('none');
  }

  private askRecommendationStyle(): void {
    this.currentStep = 'recommend_style';
    this.showAssistantMessage('¿Qué estilo prefieres?');
    this.options = [
      { id: 'style_min', label: 'Minimalista' },
      { id: 'style_mod', label: 'Moderno' },
      { id: 'style_vintage', label: 'Vintage' },
      { id: 'style_contemp', label: 'Contemporáneo' },
      { id: 'style_antic', label: 'Anticuado' }
    ];
    this.setInputMode('none');
  }

  private askRecommendationBudget(): void {
    this.currentStep = 'recommend_budget';
    this.showAssistantMessage('¿Cuál es tu presupuesto aproximado?');
    this.options = [
      { id: 'budget_low', label: 'Menos de 30 €', value: 'low' },
      { id: 'budget_medium', label: '30 € - 60 €', value: 'medium' },
      { id: 'budget_high', label: '60 € - 100 €', value: 'high' },
      { id: 'budget_premium', label: 'Más de 100 €', value: 'premium' }
    ];
    this.setInputMode('none');
  }

  private askRecommendationCategory(): void {
    this.currentStep = 'recommend_category';
    this.showAssistantMessage('¿Qué categoría te interesa?');
    this.options = this.categoryOptions();
    this.setInputMode('none');
  }

  private finishRecommendationFlow(): void {
    const queryParams = {
      room: this.recommendation.room || null,
      style: this.recommendation.style || null,
      budget: this.recommendation.budget || null,
      filterCategory: this.recommendation.category || null,
      page: 1
    };

    this.showAssistantMessage('Genial, te llevo a la selección con tus filtros.');
    this.router.navigate(['/products'], { queryParams });
    this.showRootOptions('Si necesitas algo más, aquí estoy.');
  }

  private askInfoTopic(): void {
    this.currentStep = 'info_root';
    this.showAssistantMessage('¿Qué información necesitas?');
    this.options = [
      { id: 'info_payment', label: 'Métodos de pago' },
      { id: 'info_shipping', label: 'Envíos' }
    ];
    this.setInputMode('none');
  }

  private handleInfoSelection(id: string): void {
    if (id === 'info_payment') {
      this.showAssistantMessage(
        'Nuestros métodos de pago son: Pago por tarjeta, Bizum y Transferencia.'
      );
    } else if (id === 'info_shipping') {
      this.showAssistantMessage('Solo hacemos envíos a España.');
    }
    this.showRootOptions('¿Quieres saber algo más?');
  }

  private askCatalogCategory(): void {
    this.currentStep = 'catalog_category';
    this.showAssistantMessage('¿Qué categoría quieres ver?');
    this.options = this.categoryOptions();
    this.setInputMode('none');
  }

  private navigateToCategory(category: string): void {
    this.showAssistantMessage(`Perfecto, abriendo categoría ${category}.`);
    this.router.navigate(['/products'], { queryParams: { category, page: 1 } });
    this.showRootOptions('¿Quieres ver otra cosa?');
  }

  private askContactPhone(): void {
    this.currentStep = 'contact_phone';
    this.showAssistantMessage('Déjame tu número de teléfono y un asistente te contactará.');
    this.options = [{ id: 'root', label: 'Volver al inicio' }];
    this.setInputMode('phone', 'Escribe tu número');
  }

  private categoryOptions(): ChatOption[] {
    return [
      { id: 'cat_iluminacion', label: 'Iluminación' },
      { id: 'cat_muebles', label: 'Muebles' },
      { id: 'cat_decoracion', label: 'Decoración' },
      { id: 'cat_textiles', label: 'Textiles' },
      { id: 'cat_organizadores', label: 'Organizadores' },
      { id: 'cat_bebes', label: 'Bebes' },
      { id: 'cat_aromas', label: 'Aromas' },
      { id: 'cat_exterior', label: 'Exterior' }
    ];
  }

  private showAssistantMessage(message: string): void {
    this.messages = [...this.messages, { role: 'assistant', content: message }];
    this.scrollToBottom();
  }

  private pushUserMessage(message: string): void {
    this.messages = [...this.messages, { role: 'user', content: message }];
    this.scrollToBottom();
  }

  private setInputMode(mode: InputMode, placeholder?: string): void {
    this.inputMode = mode;
    if (mode === 'none') {
      this.input = '';
    }
    this.inputPlaceholder = placeholder ?? (mode === 'phone' ? 'Escribe tu número' : 'Selecciona una opción');
  }
}
