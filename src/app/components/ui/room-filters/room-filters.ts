import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface FilterState {
    style: string;
    budget: string;
    category: string;
}

@Component({
    selector: 'app-room-filters',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './room-filters.component.html',
    styleUrls: ['./room-filters.component.scss']
})
export class RoomFiltersComponent {
    @Output() filterChange = new EventEmitter<FilterState>();

    styles = ['Minimalista', 'Moderno', 'Vintage', 'Contemporaneo', 'Anticuado'];

    budgetOptions = [
        { label: 'Menos de 30 €', value: 'low' },
        { label: '30 € – 60 €', value: 'medium' },
        { label: '60 € – 100 €', value: 'high' },
        { label: 'Más de 100 €', value: 'premium' }
    ];

    categories = ['Iluminación', 'Muebles', 'Decoración', 'Textiles', 'Organizadores', 'Bebes', 'Aromas', 'Exterior'];

    selectedStyle = '';
    selectedBudget = '';
    selectedCategory = '';

    openDropdown: string | null = null;

    toggleDropdown(name: string, event: Event) {
        event.stopPropagation();
        if (this.openDropdown === name) {
            this.openDropdown = null;
        } else {
            this.openDropdown = name;
        }
    }

    closeDropdown() {
        this.openDropdown = null;
    }

    selectStyle(style: string) {
        this.selectedStyle = style;
        this.closeDropdown();
        this.emitChange();
    }

    selectBudget(value: string) {
        this.selectedBudget = value;
        this.closeDropdown();
        this.emitChange();
    }

    selectCategory(category: string) {
        this.selectedCategory = category;
        this.closeDropdown();
        this.emitChange();
    }

    getBudgetLabel(value: string): string {
        const option = this.budgetOptions.find(o => o.value === value);
        return option ? option.label : '';
    }

    private emitChange() {
        this.filterChange.emit({
            style: this.selectedStyle,
            budget: this.selectedBudget,
            category: this.selectedCategory
        });
    }
}
