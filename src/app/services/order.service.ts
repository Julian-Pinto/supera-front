import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, map } from 'rxjs';
import { environment } from '../../environments/environment';

<<<<<<< HEAD
export type OrderState = 'CREATED' | 'PROCESSING' | 'COMPLETED' | 'CANCELLED' | 'DELIVERED';

export interface OrderItem {
  productId: string;
  // legacy fields (may be absent if backend uses new names)
  quantity?: number;
  price?: number;
  name?: string;
  // new/alternate field names returned by the service
  amount?: number;
  unitPrice?: number;
=======
export type OrderState = 'CREATED' | 'CONFIRMED' | 'PROCESSING' | 'COMPLETED' | 'CANCELLED';

export interface OrderItem {
  productId: string | number;
  quantity?: number;
  amount?: number;
  price?: number;
  unitPrice?: number;
  name?: string;
  category?: string | null;
>>>>>>> 0dddc5f2443bcffb2465eb9ed4838c36846ef91e
  subTotal?: number;
}

export interface Order {
  id?: string | { [key: string]: any };
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
  createDate?: string;
  items: OrderItem[];
  total?: number;
  state?: OrderState;
}

@Injectable({ providedIn: 'root' })
export class OrderService {
  private readonly base = `${environment.apiUrl}/orders`;

  constructor(private http: HttpClient) {}

  private browserLog(...params: unknown[]): void {
    if (typeof window !== 'undefined') {
      console.log(...params);
    }
  }

  private normalizeId(rawId: string | { [key: string]: any } | undefined): string | undefined {
    if (!rawId) {
      return undefined;
    }
    if (typeof rawId === 'string') {
      return rawId;
    }
    if (typeof rawId === 'object' && rawId !== null) {
      return (
        rawId['$oid'] ?? rawId['oid'] ?? rawId['id'] ??
        (typeof rawId['timestamp'] === 'number' ? rawId['timestamp'].toString() : undefined) ??
        (typeof rawId['date'] === 'string' ? rawId['date'] : undefined)
      );
    }
    return undefined;
  }

  private normalizeOrder(order: Order): Order {
    const normalizedId = this.normalizeId(order.id);
    const customer = order.customer ?? {
      name: order.customerName,
      phone: order.phone,
      tower: order.tower,
      apartment: order.apartment,
    };

    return {
      ...order,
      id: normalizedId,
      customer,
    };
  }

  private normalizeOrders(orders: Order[]): Order[] {
    return orders.map((order) => this.normalizeOrder(order));
  }

  private mapOrderPayload(order: Partial<Order>): Partial<Order> {
    const payload: Partial<Order> = {};

    if (order.customer) {
      payload.customer = {
        name: order.customer.name,
        phone: order.customer.phone,
        tower: order.customer.tower,
        apartment: order.customer.apartment,
      };
    } else if (order.customerName || order.phone || order.tower || order.apartment) {
      payload.customer = {
        name: order.customerName,
        phone: order.phone,
        tower: order.tower,
        apartment: order.apartment,
      };
    }

    if (order.items) {
      payload.items = order.items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        price: item.price,
        amount: item.amount,
        unitPrice: item.unitPrice,
        subTotal: item.subTotal,
      }));
    }

    if (order.total !== undefined) {
      payload.total = order.total;
    }
    if (order.state) {
      payload.state = order.state;
    }
    if (order.createDate) {
      payload.createDate = order.createDate;
    }

    return payload;
  }

  createOrder(order: Partial<Order>): Observable<Order> {
    const url = this.base;
    const payload = this.mapOrderPayload(order);
    this.browserLog('[OrderService] POST', url, 'body', payload);
    return this.http.post<Order>(url, payload).pipe(
      tap((response) => this.browserLog('[OrderService] POST', url, 'response', response)),
      map((response) => this.normalizeOrder(response))
    );
  }

  findAll(): Observable<Order[]> {
    const url = this.base;
    this.browserLog('[OrderService] GET', url);
    return this.http.get<Order[]>(url).pipe(
      tap((response) => this.browserLog('[OrderService] GET', url, 'response', response)),
      map((response) => this.normalizeOrders(response))
    );
  }

  findById(id: string | { [key: string]: any }): Observable<Order> {
    const orderId = this.normalizeId(id);
    const url = `${this.base}/${orderId}`;
    this.browserLog('[OrderService] GET', url);
    return this.http.get<Order>(url).pipe(
      tap((response) => this.browserLog('[OrderService] GET', url, 'response', response)),
      map((response) => this.normalizeOrder(response))
    );
  }

  update(id: string | { [key: string]: any }, order: Partial<Order>): Observable<Order> {
    const orderId = this.normalizeId(id);
    const url = `${this.base}/${orderId}`;
    const payload = this.mapOrderPayload(order);
    this.browserLog('[OrderService] PUT', url, 'body', payload);
    return this.http.put<Order>(url, payload).pipe(
      tap((response) => this.browserLog('[OrderService] PUT', url, 'response', response))
    );
  }

  updateStatus(id: string | { [key: string]: any }, state: OrderState): Observable<void> {
    const orderId = this.normalizeId(id);
    const url = `${this.base}/${orderId}`;
    const body = { state };
    this.browserLog('[OrderService] PATCH', url, 'body', body);
    return this.http.patch<void>(url, body).pipe(
      tap((response) => this.browserLog('[OrderService] PATCH', url, 'response', response))
    );
  }
}
