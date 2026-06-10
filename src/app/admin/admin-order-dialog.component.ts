import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { Order } from '../services/order.service';

@Component({
  selector: 'app-admin-order-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule],
  template: `
    <div class="dialog-header">
<<<<<<< HEAD
      <div>
        <h2>Detalle del pedido {{ data.id }}</h2>
        <p class="customer-line"><strong>Cliente:</strong> {{ data.customer?.name || data.customerName || '-' }}</p>
        <p class="customer-line"><strong>Tel:</strong> {{ data.customer?.phone || data.phone || '-' }} · <strong>Torre:</strong> {{ data.customer?.tower || data.tower || '-' }} · <strong>Apto:</strong> {{ data.customer?.apartment || data.apartment || '-' }}</p>
      </div>
=======
>>>>>>> 0dddc5f2443bcffb2465eb9ed4838c36846ef91e
      <button mat-icon-button aria-label="Cerrar" (click)="dialogRef.close()">
        <mat-icon>close</mat-icon>
      </button>
    </div>

    <section class="dialog-content">
      <table>
        <thead>
          <tr>
            <th>Cant</th>
            <th>Producto</th>
            <th>V/uni</th>
            <th>Sub total</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let item of data.items">
<<<<<<< HEAD
            <td>{{ item.amount ?? item.quantity ?? 0 }}</td>
            <td>{{ item.productId }}</td>
            <td>{{ (item.unitPrice ?? item.price ?? 0) | currency:'COP ':'symbol':'1.0-2' }}</td>
            <td>{{ (item.subTotal ?? ((item.unitPrice ?? item.price ?? 0) * (item.amount ?? item.quantity ?? 0))) | currency:'COP ':'symbol':'1.0-2' }}</td>
=======
            <td>{{ getItemQuantity(item) ?? '-' }}</td>
            <td>{{ item.name || ('Producto ' + item.productId) }}</td>
            <td>{{ getItemUnitPrice(item) != null ? (getItemUnitPrice(item) | currency:'COP':'symbol':'1.0-2') : '-' }}</td>
            <td>{{ getItemTotal(item) != null ? (getItemTotal(item) | currency:'COP':'symbol':'1.0-2') : '-' }}</td>
>>>>>>> 0dddc5f2443bcffb2465eb9ed4838c36846ef91e
          </tr>
        </tbody>
      </table>
    </section>

    <footer class="dialog-footer">
      <span>Total del pedido:</span>
      <strong>{{ data.total ?? calculateTotal() | currency:'COP ':'symbol':'1.0-2' }}</strong>
    </footer>
  `,
  styles: [`
    :host {
      display: block;
      padding: 12px;
      box-sizing: border-box;
    }

    .dialog-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 1rem;
    }

    .customer-line {
      margin: 0.25rem 0;
      color: rgba(0, 0, 0, 0.7);
    }

    .dialog-content {
      margin-top: 1rem;
      overflow-x: auto;
    }

    table {
      width: 100%;
      border-collapse: collapse;
    }

    th,
    td {
      padding: 0.75rem 0.8rem;
      text-align: left;
      border-bottom: 1px solid #e0e0e0;
    }

    th {
      font-weight: 700;
      color: #1f2a60;
    }

    .dialog-footer {
      margin-top: 1rem;
      display: flex;
      justify-content: flex-end;
      gap: 0.75rem;
      font-size: 1rem;
      align-items: center;
    }
  `],
})
export class AdminOrderDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<AdminOrderDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Order
  ) {}

  getItemQuantity(item: { quantity?: number; amount?: number }): number | undefined {
    return item.quantity ?? item.amount;
  }

  getItemUnitPrice(item: { price?: number; unitPrice?: number }): number | undefined {
    return item.price ?? item.unitPrice;
  }

  getItemTotal(item: { subTotal?: number; price?: number; unitPrice?: number; quantity?: number; amount?: number }): number | undefined {
    const quantity = this.getItemQuantity(item);
    const unitPrice = this.getItemUnitPrice(item);
    return item.subTotal ?? (quantity != null && unitPrice != null ? quantity * unitPrice : undefined);
  }

  calculateTotal(): number {
<<<<<<< HEAD
    return this.data.items.reduce((sum, item) => sum + (item.subTotal ?? ((item.unitPrice ?? item.price ?? 0) * (item.amount ?? item.quantity ?? 0))), 0);
=======
    return this.data.items.reduce((sum, item) => sum + (this.getItemTotal(item) ?? 0), 0);
>>>>>>> 0dddc5f2443bcffb2465eb9ed4838c36846ef91e
  }
}
