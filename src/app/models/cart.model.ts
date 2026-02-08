import { Product } from './product.model';
import { User } from './user.model';

export interface CartProduct {
    id: number;
    quantity: number;
    cart: Cart;
    product: Product;
}

export interface Cart {
    id: number;
    total: number;
    price: number;
    date: string;
    status: string;
    user: User;
    items: CartProduct[];
}
