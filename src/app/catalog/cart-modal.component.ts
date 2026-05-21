import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';

export interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  category: string;
}

@Component({
  selector: 'app-cart-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, MatDialogModule, MatButtonModule, MatIconModule, MatTableModule, MatFormFieldModule, MatInputModule, MatSelectModule],
  template: `
    <div class="cart-modal">
      <div class="modal-header">
        <h2 mat-dialog-title>{{ isCheckoutStage ? 'Datos del Cliente' : 'Tu Carrito' }}</h2>
        <button mat-icon-button (click)="dialogRef.close()" class="close-button" aria-label="Cerrar">
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <div class="cart-content" *ngIf="!isCheckoutStage; else checkoutForm">
        <div *ngIf="getItemsToDisplay().length > 0; else emptyCart" class="table-container">
          <table class="cart-table">
            <thead>
              <tr>
                <th>Producto</th>
                <th>Categoría</th>
                <th class="text-center">Cantidad</th>
                <th class="text-right">Precio Unit.</th>
                <th class="text-right">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let item of getItemsToDisplay()">
                <td class="product-name">{{ item.name }}</td>
                <td class="product-category">{{ item.category }}</td>
                <td class="text-center">{{ item.quantity }}</td>
                <td class="text-right">{{ item.price | currency:'COP':'symbol':'1.0-2' }}</td>
                <td class="text-right subtotal">{{ item.price * item.quantity | currency:'COP':'symbol':'1.0-2' }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <ng-template #emptyCart>
          <div class="empty-state">
            <mat-icon>shopping_cart</mat-icon>
            <p>Tu carrito está vacío</p>
          </div>
        </ng-template>
      </div>

      <ng-template #checkoutForm>
        <div class="checkout-form">

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Nombre del cliente</mat-label>
            <input matInput type="text" [(ngModel)]="customerName" />
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Torre</mat-label>
            <mat-select [(ngModel)]="tower">
              <mat-option value="1">Torre 1</mat-option>
              <mat-option value="2">Torre 2</mat-option>
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width" [class.invalid-field]="apartmentInvalid">
            <mat-label>Apartamento</mat-label>
            <input
              matInput
              type="text"
              inputmode="numeric"
              maxlength="6"
              [(ngModel)]="apartment"
              (keydown)="allowOnlyDigits($event, 'apartment')"
              (input)="onApartmentInput($event)"
            />
            <mat-error *ngIf="apartmentInvalid">
              Escribe solo números.
            </mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width" [class.invalid-field]="phoneInvalid">
            <mat-label>Teléfono</mat-label>
            <input
              matInput
              type="tel"
              inputmode="numeric"
              maxlength="10"
              [(ngModel)]="phone"
              (keydown)="allowOnlyDigits($event, 'phone')"
              (input)="onPhoneInput($event)"
            />
            <mat-error *ngIf="phoneInvalid">
              Escribe solo números.
            </mat-error>
          </mat-form-field>

          <div class="required-message" *ngIf="isOrderFormInvalid()">
            Todos estos datos son requeridos para llevar su pedido
          </div>
        </div>
      </ng-template>

      <div class="cart-summary" *ngIf="!isCheckoutStage && getItemsToDisplay().length > 0">
        <div class="summary-row">
          <span class="label">Total:</span>
          <span class="total">{{ calculateTotal() | currency:'COP':'symbol':'1.0-2' }}</span>
        </div>
      </div>

      <div mat-dialog-actions class="dialog-actions">
        <button mat-stroked-button (click)="onClear()" *ngIf="!isCheckoutStage && getItemsToDisplay().length > 0">
          <mat-icon>delete</mat-icon>
          Limpiar Carrito
        </button>
        <button mat-stroked-button color="primary" *ngIf="isCheckoutStage" (click)="goBackToCart()">
          <mat-icon>arrow_back</mat-icon>
          Atrás
        </button>
        <button mat-flat-button color="primary" *ngIf="!isCheckoutStage && getItemsToDisplay().length > 0" (click)="startCheckout()">
          Confirmar Pedido
        </button>
        <button mat-flat-button color="primary" *ngIf="isCheckoutStage" (click)="placeOrder()" [disabled]="isOrderFormInvalid()">
          Realizar Pedido
        </button>
        <button mat-flat-button color="primary" *ngIf="getItemsToDisplay().length === 0" (click)="dialogRef.close()">
          Cerrar
        </button>
      </div>
    </div>
  `,
  styles: [`
    .cart-modal {
      width: min(100%, 700px);
      max-width: 700px;
      overflow-x: hidden;
      box-sizing: border-box;
      min-width: 0;
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0;
    }

    .modal-header h2 {
      margin: 0;
      flex: 1;
    }

    .close-button {
      color: rgba(0, 0, 0, 0.54);
    }

    .close-button:hover {
      color: rgba(0, 0, 0, 0.87);
    }

    .cart-content {
      max-height: 450px;
      overflow-y: auto;
      margin: 1rem 0;
      min-width: 0;
    }

    .table-container {
      overflow-x: auto;
      min-width: 0;
      overflow-x: auto;
    }

    .cart-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.95rem;
    }

    .cart-table thead {
      background-color: #f5f5f5;
      font-weight: 600;
    }

    .cart-table th {
      padding: 0.75rem;
      text-align: left;
      border-bottom: 2px solid #e0e0e0;
      font-size: 0.85rem;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .cart-table td {
      padding: 0.75rem;
      border-bottom: 1px solid #f0f0f0;
    }

    .cart-table tbody tr:hover {
      background-color: #fafafa;
    }

    .product-name {
      font-weight: 600;
      color: #1a237e;
    }

    .product-category {
      font-size: 0.85rem;
      color: rgba(0, 0, 0, 0.6);
    }

    .text-center {
      text-align: center;
    }

    .text-right {
      text-align: right;
    }

    .subtotal {
      font-weight: 600;
      color: #1a237e;
    }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 2rem 1rem;
      color: rgba(0, 0, 0, 0.5);
    }

    .empty-state mat-icon {
      font-size: 3rem;
      width: 3rem;
      height: 3rem;
      margin-bottom: 1rem;
    }

    .cart-summary {
      border-top: 2px solid #e0e0e0;
      padding: 1rem 0;
      margin-bottom: 1rem;
      text-align: right;
    }

    .summary-row {
      display: flex;
      justify-content: center;
      gap: 2rem;
      font-weight: 700;
      font-size: 1.1rem;
    }

    .total {
      color: #1a237e;
      min-width: 6rem;
    }

    .dialog-actions {
      display: flex;
      gap: 0.75rem;
      justify-content: center;
      flex-wrap: wrap;
    }

    .checkout-form {
      display: grid;
      gap: 1rem;
      margin: 1rem 0;
      min-width: 0;
      margin: 20px;
    }

    .full-width {
      width: 100%;
    }

    .invalid-field .mat-form-field-outline {
      stroke: #f44336 !important;
    }

    .invalid-field .mat-form-field-subscript-wrapper {
      color: #f44336;
    }

    .required-message {
      color: #d32f2f;
      font-size: 0.9rem;
      margin-top: 0.5rem;
      margin-left: 0.25rem;
    }

    .checkout-title {
      color: #d32f2f;
      font-weight: 700;
      text-align: center;
      width: 100%;
      margin: 0 0 1rem;
    }
  `],
})
export class CartModalComponent {
  constructor(
    public dialogRef: MatDialogRef<CartModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { items: CartItem[]; onClear: () => void }
  ) {}

  getItemsToDisplay(): CartItem[] {
    return this.data.items;
  }

  calculateTotal(): number {
    return this.getItemsToDisplay().reduce((sum, item) => sum + item.price * item.quantity, 0);
  }

  isCheckoutStage = false;
  customerName = '';
  tower = '1';
  apartment = '';
  phone = '';
  apartmentInvalid = false;
  phoneInvalid = false;

  startCheckout(): void {
    this.isCheckoutStage = true;
  }

  goBackToCart(): void {
    this.isCheckoutStage = false;
  }

  placeOrder(): void {
    if (
      !this.customerName.trim() ||
      !this.apartment.trim() ||
      !this.phone.trim() ||
      !this.isApartmentValid() ||
      !this.isPhoneValid()
    ) {
      return;
    }

    this.dialogRef.close({
      success: true,
      customer: {
        name: this.customerName.trim(),
        tower: this.tower,
        apartment: this.apartment.trim(),
        phone: this.phone.trim(),
      },
    });
  }

  private isApartmentValid(): boolean {
    return /^[0-9]+$/.test(this.apartment.trim());
  }

  private isPhoneValid(): boolean {
    return /^3\d{9}$/.test(this.phone.trim());
  }

  isOrderFormInvalid(): boolean {
    return (
      !this.customerName.trim() ||
      !this.apartment.trim() ||
      !this.phone.trim() ||
      this.apartmentInvalid ||
      this.phoneInvalid
    );
  }

  onApartmentInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const rawValue = input.value;
    const sanitized = rawValue.replace(/\D+/g, '');
    this.apartmentInvalid = rawValue !== sanitized;
    if (sanitized !== rawValue) {
      input.value = sanitized;
      this.apartment = sanitized;
    }
  }

  onPhoneInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const rawValue = input.value;
    const sanitized = rawValue.replace(/\D+/g, '');
    this.phoneInvalid = rawValue !== sanitized;
    if (sanitized !== rawValue) {
      input.value = sanitized;
      this.phone = sanitized;
    }
  }

  allowOnlyDigits(event: KeyboardEvent, field: 'apartment' | 'phone'): void {
    const allowedKeys = [
      'Backspace',
      'Tab',
      'Enter',
      'Escape',
      'ArrowLeft',
      'ArrowRight',
      'ArrowUp',
      'ArrowDown',
      'Delete',
      'Home',
      'End',
    ];

    if (allowedKeys.includes(event.key) || event.ctrlKey || event.metaKey) {
      return;
    }

    if (!/^[0-9]$/.test(event.key)) {
      event.preventDefault();
      if (field === 'apartment') {
        this.apartmentInvalid = true;
      } else {
        this.phoneInvalid = true;
      }
      return;
    }

    if (field === 'apartment') {
      this.apartmentInvalid = false;
    } else {
      this.phoneInvalid = false;
    }
  }

  onClear(): void {
    this.data.onClear();
  }
}
