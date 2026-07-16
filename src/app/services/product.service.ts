import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, map } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  description?: string;
  imageUrl?: string;
  imageName?: string;
  available: boolean;
  idInvoice?: string;
  profitMargin?: number;
  quantity?: number;
  expirationDate?: string;
  priceWithProfit?: number;
}

export interface Category {
  id?: string | { [key: string]: any };
  _id?: string;
  categoryName: string;
}

export interface BulkStockDecrease {
  productId: string;
  quantityToSubtract: number;
}

@Injectable({ providedIn: 'root' })
export class ProductService {
  private readonly base = `${environment.apiUrl}/products`;

  constructor(private http: HttpClient) {}

  private browserLog(...params: unknown[]): void {
    if (typeof window !== 'undefined') {
      console.log(...params);
    }
  }

  private normalizeCategory(category: Category): Category {
    const rawId = category.id ?? category._id;
    let normalizedId: string | undefined;

    if (typeof rawId === 'string') {
      normalizedId = rawId;
    } else if (typeof rawId === 'object' && rawId !== null) {
      if ('$oid' in rawId && typeof rawId['$oid'] === 'string') {
        normalizedId = rawId['$oid'];
      } else if ('oid' in rawId && typeof rawId['oid'] === 'string') {
        normalizedId = rawId['oid'];
      } else if ('id' in rawId && typeof rawId['id'] === 'string') {
        normalizedId = rawId['id'];
      } else if ('timestamp' in rawId && typeof rawId['timestamp'] === 'number') {
        normalizedId = rawId['timestamp'].toString();
      } else if ('date' in rawId && typeof rawId['date'] === 'string') {
        normalizedId = rawId['date'];
      } else {
        normalizedId = JSON.stringify(rawId);
      }
    }

    return {
      ...category,
      id: normalizedId,
    };
  }

  private normalizeProduct(product: Product): Product {
    const normalizedPrice = product.priceWithProfit ?? product.price;

    return {
      ...product,
      price: normalizedPrice,
      priceWithProfit: product.priceWithProfit ?? normalizedPrice,
      quantity: product.quantity ?? 0,
      expirationDate: product.expirationDate,
      profitMargin: product.profitMargin,
    };
  }

  findAll(): Observable<Product[]> {
    const url = this.base;
    this.browserLog('[ProductService] GET', url);
    return this.http.get<Product[]>(url).pipe(
      tap((response) => this.browserLog('[ProductService] GET', url, 'response', response)),
      map((products) => products.map((product) => this.normalizeProduct(product)))
    );
  }

  findAllAdmin(): Observable<Product[]> {
    const url = `${this.base}/admin`;
    this.browserLog('[ProductService] GET', url);
    return this.http.get<Product[]>(url).pipe(
      tap((response) => this.browserLog('[ProductService] GET', url, 'response', response))
    );
  }

  findCategories(): Observable<Category[]> {
    const url = `${this.base}/categories`;
    this.browserLog('[ProductService] GET', url);
    return this.http.get<Category[]>(url).pipe(
      tap((response) => this.browserLog('[ProductService] GET', url, 'response', response)),
      map((categories) => categories.map((category) => this.normalizeCategory(category)))
    );
  }

  findById(id: string | number): Observable<Product> {
    const url = `${this.base}/${id}`;
    this.browserLog('[ProductService] GET', url);
    return this.http.get<Product>(url).pipe(
      tap((response) => this.browserLog('[ProductService] GET', url, 'response', response))
    );
  }

  private mapProductPayload(product: Partial<Product>): Partial<Product> {
    return {
      name: product.name,
      category: product.category,
      price: this.roundPriceToHundred(product.price),
      description: product.description,
      imageUrl: product.imageUrl,
      imageName: product.imageName,
      available: product.available,
      idInvoice: product.idInvoice,
      profitMargin: product.profitMargin,
      quantity: product.quantity,
      expirationDate: product.expirationDate,
      priceWithProfit: this.roundPriceToHundred(product.priceWithProfit ?? product.price),
    };
  }

  public roundPriceToHundred(value?: number | null): number | undefined {
    if (value === undefined || value === null) {
      return undefined;
    }

    const n = Number(value);
    if (!isFinite(n) || isNaN(n)) {
      return undefined;
    }

    // Round up to nearest multiple of 100 and remove cents
    return Math.ceil(n / 100) * 100;
  }

  save(product: Partial<Product>): Observable<Product> {
    const url = this.base;
    const payload = this.mapProductPayload(product);
    this.browserLog('[ProductService] POST', url, 'body', payload);
    return this.http.post<Product>(url, payload).pipe(
      tap((response) => this.browserLog('[ProductService] POST', url, 'response', response))
    );
  }

  createProduct(productData: FormData): Observable<Product> {
    const url = this.base;
    this.browserLog('[ProductService] POST', url, 'multipart/form-data');
    // Normalize price fields in FormData to ensure rounding to 100s
    const normalized = new FormData();
    for (const entry of productData.entries()) {
      const [key, val] = entry as [string, FormDataEntryValue];
      if (key === 'price' || key === 'priceWithProfit') {
        const num = Number(val as string);
        const rounded = this.roundPriceToHundred(num);
        if (rounded !== undefined) {
          normalized.append(key, String(rounded));
          continue;
        }
      }
      normalized.append(key, val);
    }

    return this.http.post<Product>(url, normalized).pipe(
      tap((response) => this.browserLog('[ProductService] POST', url, 'response', response))
    );
  }

  createCategory(categoryName: string): Observable<Category> {
    const url = `${this.base}/categories`;
    const body = { categoryName };
    this.browserLog('[ProductService] POST', url, 'body', body);
    return this.http.post<Category>(url, body).pipe(
      tap((response) => this.browserLog('[ProductService] POST', url, 'response', response)),
      map((category) => this.normalizeCategory(category))
    );
  }

  deleteCategory(id: string | number): Observable<void> {
    const url = `${this.base}/categories/${id}`;
    this.browserLog('[ProductService] DELETE', url);
    return this.http.delete<void>(url).pipe(
      tap((response) => this.browserLog('[ProductService] DELETE', url, 'response', response))
    );
  }

  deleteProduct(id: string | number): Observable<void> {
    const url = `${this.base}/delete/${id}`;
    this.browserLog('[ProductService] GET', url);
    return this.http.get<void>(url).pipe(
      tap((response) => this.browserLog('[ProductService] GET', url, 'response', response))
    );
  }

  update(id: string | number, product: Partial<Product>): Observable<Product> {
    const url = `${this.base}/${id}`;
    const payload = this.mapProductPayload(product);
    this.browserLog('[ProductService] PUT', url, 'body', payload);
    return this.http.put<Product>(url, payload).pipe(
      tap((response) => this.browserLog('[ProductService] PUT', url, 'response', response))
    );
  }

  updateAvailability(id: string | number, available: boolean): Observable<void> {
    const url = `${this.base}/${id}/availability`;
    const body = { available };
    this.browserLog('[ProductService] PATCH', url, 'body', body);
    return this.http.patch<void>(url, body).pipe(
      tap((response) => this.browserLog('[ProductService] PATCH', url, 'response', response))
    );
  }

  bulkDecreaseStock(items: BulkStockDecrease[]): Observable<void> {
    const url = `${this.base}/bulk-decrease-stock`;
    this.browserLog('[ProductService] POST', url, 'body', items);
    return this.http.post<void>(url, items).pipe(
      tap((response) => this.browserLog('[ProductService] POST', url, 'response', response))
    );
  }
}
