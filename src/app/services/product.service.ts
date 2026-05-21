import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  description?: string;
  available: boolean;
}

@Injectable({ providedIn: 'root' })
export class ProductService {
  private readonly base = '/api/products';

  constructor(private http: HttpClient) {}

  findAll(): Observable<Product[]> {
    return this.http.get<Product[]>(this.base);
  }

  findById(id: string | number): Observable<Product> {
    return this.http.get<Product>(`${this.base}/${id}`);
  }

  save(product: Partial<Product>): Observable<Product> {
    return this.http.post<Product>(this.base, product);
  }

  update(id: string | number, product: Partial<Product>): Observable<Product> {
    return this.http.put<Product>(`${this.base}/${id}`, product);
  }

  updateAvailability(id: string | number, available: boolean): Observable<void> {
    return this.http.patch<void>(`${this.base}/${id}/availability`, { available });
  }
}
