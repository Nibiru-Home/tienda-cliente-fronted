import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Product } from '../models/product.model';
import { HTTPService } from './http.service';

@Injectable({
    providedIn: 'root'
})
export class ProductService {
    constructor(private http: HTTPService) { }

    getAllProducts(): Observable<Product[]> {
        return this.http.getAll<Product>('/api/products');
    }

    getProductById(id: number): Observable<Product> {
        return this.http.get<Product>(`/api/products/${id}`);
    }
}
