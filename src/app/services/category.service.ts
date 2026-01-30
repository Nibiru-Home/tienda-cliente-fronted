import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Category } from '../models/product.model';
import { HTTPService } from './http.service';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private readonly categoriesRoute = '/api/categories';

  constructor(private httpService: HTTPService) { }

  getAllCategories(): Observable<Category[]> {
    return this.httpService.getAll<Category>(this.categoriesRoute);
  }
}
