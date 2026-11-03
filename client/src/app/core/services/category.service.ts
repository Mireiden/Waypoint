import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { environment } from '../../../environments/environment';
import type {
  Category,
  CategoryWithCount,
  CreateCategoryPayload,
} from '../../models/category.model';

@Injectable({ providedIn: 'root' })
export class CategoryService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/categories`;

  getAll() {
    return this.http.get<CategoryWithCount[]>(this.base);
  }

  create(payload: CreateCategoryPayload) {
    return this.http.post<Category>(this.base, payload, { withCredentials: true });
  }

  update(id: number, payload: Partial<CreateCategoryPayload>) {
    return this.http.patch<Category>(`${this.base}/${id}`, payload, { withCredentials: true });
  }

  remove(id: number) {
    return this.http.delete(`${this.base}/${id}`, { withCredentials: true });
  }
}
