import { Component, computed, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatBadgeModule } from '@angular/material/badge';
import { MatDialog } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CartModalComponent, CartItem } from './cart-modal.component';
import { ProductService, Product } from '../services/product.service';
import { OrderService } from '../services/order.service';

@Component({
  selector: 'app-catalog',
  standalone: true,
  imports: [
    CommonModule,
    MatToolbarModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatBadgeModule,
    MatTooltipModule,
  ],
  templateUrl: './catalog.component.html',
  styleUrls: ['./catalog.component.scss'],
})
export class CatalogComponent {
  private readonly dialog = inject(MatDialog);

  readonly products = signal<Product[]>([]);

  orderMessage = signal('');
  searchTerm = signal('');
  productQuantities = signal<Record<number, number>>({});

  getQuantity(productId: number): number {
    return this.productQuantities()[productId] ?? 1;
  }

  changeQuantity(productId: number, delta: number): void {
    const current = this.getQuantity(productId);
    const next = Math.max(1, current + delta);
    this.productQuantities.update((state) => ({
      ...state,
      [productId]: next,
    }));
  }

  readonly filteredProducts = computed(() => {
    const query = this.searchTerm().trim().toLowerCase();
    if (!query) {
      return this.products();
    }

    return this.products().filter((product) => {
      return (
        product.name.toLowerCase().includes(query) ||
        product.category.toLowerCase().includes(query) ||
        product.description?.toLowerCase().includes(query)
      );
    });
  });

  cart = signal<CartItem[]>([]);

  private productService = inject(ProductService);
  private orderService = inject(OrderService);

  constructor() {
    this.loadProducts();
  }

  private loadProducts(): void {
    this.productService.findAll().subscribe({
      next: (prods) => {
        this.products.set(prods);
        const defaults = Object.fromEntries(prods.map((p) => [p.id, 1]));
        this.productQuantities.set(defaults);
      },
      error: () => {
        this.orderMessage.set('No se pudieron cargar los productos');
      },
    });
  }

  readonly cartItemCount = computed(() => {
    return this.cart().reduce((sum, item) => sum + item.quantity, 0);
  });

  addToCart(product: Product): void {
    const quantity = this.getQuantity(product.id);
    const existingItem = this.cart().find((item) => item.id === product.id);

    if (existingItem) {
      this.cart.update((items) =>
        items.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + quantity } : item
        )
      );
    } else {
      this.cart.update((items) => [
        ...items,
        {
          id: product.id,
          name: product.name,
          price: product.price,
          quantity,
          category: product.category,
        },
      ]);
    }

    this.orderMessage.set(`${product.name} (x${quantity}) agregado al carrito`);
  }

  openCart(): void {
    const dialogRef = this.dialog.open(CartModalComponent, {
      data: {
        items: this.cart(),
        onClear: () => {
          this.cart.set([]);
          this.dialog.closeAll();
        },
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result?.success && result.customer) {
        const order = {
          customer: result.customer,
          items: this.cart().map((item) => ({ productId: item.id, quantity: item.quantity, price: item.price })),
          total: this.cart().reduce((s, i) => s + i.price * i.quantity, 0),
        };

        this.orderService.createOrder(order).subscribe({
          next: () => {
            this.orderMessage.set('Pedido creado correctamente');
            this.cart.set([]);
            this.dialog.closeAll();
          },
          error: () => {
            this.orderMessage.set('Error creando el pedido');
          },
        });
      }
    });
  }
}
