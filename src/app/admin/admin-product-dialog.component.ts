import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { Product, ProductService, Category } from '../services/product.service';

@Component({
  selector: 'app-admin-product-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
  ],
  template: `
    <div class="dialog-header">
      <h2>{{ mode === 'create' ? 'Crear producto' : 'Editar producto' }}</h2>
      <button mat-icon-button aria-label="Cerrar" (click)="dialogRef.close()">
        <mat-icon>close</mat-icon>
      </button>
    </div>

    <div class="dialog-content">
      <mat-form-field appearance="outline" class="full-width" *ngIf="mode === 'edit'">
        <mat-label>ID</mat-label>
        <input matInput [value]="product.id" disabled />
      </mat-form-field>

      <mat-form-field appearance="outline" class="full-width">
        <mat-label>Nombre</mat-label>
        <input matInput [(ngModel)]="product.name" />
      </mat-form-field>

      <mat-form-field appearance="outline" class="full-width">
        <mat-label>Categoría</mat-label>
        <mat-select [(ngModel)]="product.category">
          <mat-option *ngFor="let category of categories" [value]="category.categoryName">
            {{ category.categoryName }}
          </mat-option>
        </mat-select>
      </mat-form-field>

      <div class="two-columns">
        <mat-form-field appearance="outline" class="half-width">
          <mat-label>Cantidad</mat-label>
          <input matInput type="number" [(ngModel)]="product.quantity" />
        </mat-form-field>

        <mat-form-field appearance="outline" class="half-width">
          <mat-label>Factura</mat-label>
          <input matInput [(ngModel)]="product.idInvoice" />
        </mat-form-field>
      </div>

      <div class="file-field">
        <input type="file" hidden #fileInput (change)="onFileSelected($event)" />
        <button mat-stroked-button type="button" (click)="fileInput.click()">
          Seleccionar imagen
        </button>
        <span class="file-name" *ngIf="selectedImageName">{{ selectedImageName }}</span>
      </div>

      <div class="two-columns">
        <mat-form-field appearance="outline" class="half-width">
          <mat-label>Precio unitario</mat-label>
          <input
            matInput
            type="number"
            name="price"
            required
            [(ngModel)]="product.price"
            #priceModel="ngModel"
          />
          <mat-error *ngIf="priceModel.invalid && priceModel.touched">
            El precio unitario es obligatorio.
          </mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline" class="half-width">
          <mat-label>Porcentaje de ganancia</mat-label>
          <input
            matInput
            type="number"
            step="0.01"
            name="profitMargin"
            required
            [(ngModel)]="product.profitMargin"
            #profitMarginModel="ngModel"
          />
          <mat-error *ngIf="profitMarginModel.invalid && profitMarginModel.touched">
            El porcentaje de ganancia es obligatorio.
          </mat-error>
        </mat-form-field>
      </div>

      <div class="profit-summary">
        Precio con ganancia:
        <strong>{{ calculatePriceWithProfit() | currency:'COP':'symbol':'1.0-2' }}</strong>
      </div>

      <mat-form-field appearance="outline" class="full-width">
        <mat-label>Descripción</mat-label>
        <textarea matInput rows="3" [(ngModel)]="product.description"></textarea>
      </mat-form-field>

      <div class="toggle-row">
        <span>Estado</span>
        <button mat-flat-button color="primary" type="button" (click)="toggleAvailable()">
          {{ product.available ? 'Activo' : 'Inactivo' }}
        </button>
      </div>

    </div>

    <div class="dialog-actions">
      <button
        mat-flat-button
        color="primary"
        (click)="saveProduct()"
        [disabled]="!product.name || !product.category || product.price == null || product.profitMargin == null"
      >
        Guardar
      </button>
      <button mat-stroked-button (click)="dialogRef.close()">Cancelar</button>
    </div>
  `,
  styles: [
    `
      .dialog-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 1rem;
        margin-bottom: 1rem;
      }

      .dialog-content {
        display: grid;
        gap: 1rem;
      }

      .full-width {
        width: 100%;
      }

      .two-columns {
        display: flex;
        gap: 0.75rem;
      }

      .half-width {
        flex: 1 1 0;
      }

      .file-field {
        display: flex;
        gap: 0.75rem;
        align-items: center;
      }

      .file-name {
        font-size: 0.95rem;
        color: rgba(0, 0, 0, 0.7);
      }

      .toggle-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .profit-summary {
        margin-top: 0.5rem;
        font-size: 0.95rem;
      }

      .dialog-actions {
        margin-top: 1.5rem;
        display: flex;
        gap: 0.75rem;
        justify-content: flex-end;
      }
    `,
  ],
})
export class AdminProductDialogComponent {
  product: Partial<Product>;
  mode: 'create' | 'edit';
  categories: Category[] = [];
  selectedImageName?: string;

  constructor(
    public dialogRef: MatDialogRef<AdminProductDialogComponent>,
    @Inject(MAT_DIALOG_DATA) data: { product: Partial<Product>; mode: 'create' | 'edit' },
    private productService: ProductService
  ) {
    this.mode = data.mode;
    this.product = {
      available: true,
      category: '',
      price: 0,
      ...data.product,
    };
    this.selectedImageName = this.product.imageUrl;
    this.loadCategories();
  }

  loadCategories(): void {
    this.productService.findCategories().subscribe({
      next: (categories) => (this.categories = categories),
      error: () => {
        this.categories = [];
      },
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) {
      return;
    }
    this.selectedImageName = file.name;
    this.product.imageUrl = file.name;
  }

  toggleAvailable(): void {
    this.product.available = !this.product.available;
  }

  calculatePriceWithProfit(): number {
    const price = Number(this.product.price ?? 0);
    const margin = Number(this.product.profitMargin ?? 0);
    return price + (price * margin) / 100;
  }

  saveProduct(): void {
    const payload: Partial<Product> = {
      ...this.product,
      imageUrl: this.product.imageUrl || this.selectedImageName,
    };

    const save$ = this.mode === 'edit' && this.product.id ?
      this.productService.update(this.product.id, payload) :
      this.productService.createProduct(payload);

    save$.subscribe({
      next: (result) => this.dialogRef.close(result),
      error: () => this.dialogRef.close(),
    });
  }
}
