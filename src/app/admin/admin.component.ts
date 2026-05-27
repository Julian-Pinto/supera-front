import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { AuthService } from '../auth.service';
import { Order, OrderItem, OrderService, OrderState } from '../services/order.service';
import { AdminOrderDialogComponent } from './admin-order-dialog.component';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [
    CommonModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
  ],
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss'],
})
export class AdminComponent {
  readonly orders = signal<Order[]>([]);
  readonly actionMessage = signal('');
  readonly orderStates: OrderState[] = ['CREATED', 'PROCESSING', 'COMPLETED', 'CANCELLED'];

  private readonly orderService = inject(OrderService);
  private readonly authService = inject(AuthService);
  private readonly dialog = inject(MatDialog);
  private readonly router = inject(Router);

  constructor() {
    this.loadOrders();
  }

  private loadOrders(): void {
    this.orderService.findAll().subscribe({
      next: (orders) => {
        this.orders.set(orders);
        this.actionMessage.set('');
      },
      error: () => {
        this.actionMessage.set('No se pudieron cargar los pedidos');
      },
    });
  }

  openOrder(order: Order): void {
    this.dialog.open(AdminOrderDialogComponent, {
      data: order,
      width: '760px',
    });
  }

  updateOrderStatus(order: Order, state: OrderState): void {
    if (!order.id) {
      return;
    }

    this.orderService.updateStatus(order.id, state).subscribe({
      next: () => {
        this.orders.update((orders) =>
          orders.map((item) => (item.id === order.id ? { ...item, state } : item))
        );
        this.actionMessage.set(`Estado del pedido ${order.id} actualizado a ${state}`);
      },
      error: () => {
        this.actionMessage.set('No se pudo actualizar el estado del pedido');
      },
    });
  }

  getItemCount(order: Order): number {
    return order.items.reduce((sum, item) => sum + this.getItemQuantity(item), 0);
  }

  formatTotal(order: Order): number {
    return order.total ?? order.items.reduce((sum, item) => sum + this.getItemQuantity(item) * this.getItemUnitPrice(item), 0);
  }

  markOrderConfirmed(order: Order): void {
    if (!order.id) {
      return;
    }

    const updatedOrder: Order = {
      ...order,
      state: 'CONFIRMED',
    };

    this.orderService.update(order.id, updatedOrder).subscribe({
      next: (savedOrder) => {
        this.orders.update((orders) =>
          orders.map((item) => (item.id === order.id ? savedOrder : item))
        );
        this.actionMessage.set(`Pedido ${order.id} actualizado a CONFIRMED`);
      },
      error: () => {
        this.actionMessage.set(`No se pudo actualizar el pedido ${order.id}`);
      },
    });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  private getItemQuantity(item: OrderItem): number {
    return item.quantity ?? item.amount ?? 0;
  }

  private getItemUnitPrice(item: OrderItem): number {
    return item.price ?? item.unitPrice ?? 0;
  }
}
