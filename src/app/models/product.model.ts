export interface Category {
    id: number;
    name: string;
}

export type Style = 'MINIMALISTA' | 'MODERNO' | 'VINTAGE' | 'CONTEMPORANEO' | 'ANTICUADO';

export interface Product {
    id: number;
    name: string;
    description: string;
    price: number;
    stock: number;
    image: string;
    images: string[];
    category: Category[];
    styles: Style[];
    rooms: string[];
}
