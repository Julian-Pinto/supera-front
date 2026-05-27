import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export type OrderState = 'CREATED' | 'CONFIRMED' | 'PROCESSING' | 'COMPLETED' | 'CANCELLED';

export interface OrderItem {
  productId: string | number;
  quantity?: number;
  amount?: number;
  price?: number;
  unitPrice?: number;
  name?: string;
  category?: string | null;
  subTotal?: number;
}

export interface Order {
  id?: string;
  customer?: {
    name?: string;
    tower?: string;
    apartment?: string;
    phone?: string;
  };
  customerName?: string;
  phone?: string;
  tower?: string;
  apartment?: string;
  items: OrderItem[];
  total?: number;
  state?: OrderState;
}

@Injectable({ providedIn: 'root' })
export class OrderService {
  private readonly base = '/api/orders';

  constructor(private http: HttpClient) {}

  createOrder(order: Partial<Order>): Observable<Order> {
    return this.http.post<Order>(this.base, order);
  }

  findAll(): Observable<Order[]> {
    return this.http.get<Order[]>(this.base);
  }

  findById(id: string): Observable<Order> {
    return this.http.get<Order>(`${this.base}/${id}`);
  }

  update(id: string, order: Partial<Order>): Observable<Order> {
    return this.http.put<Order>(`${this.base}/${id}`, order);
  }

  updateStatus(id: string, state: OrderState): Observable<void> {
    return this.http.patch<void>(`${this.base}/${id}`, { state });
  }
}
