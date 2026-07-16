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
import { OrderDisabledDialogComponent } from './order-disabled-dialog.component';
import { ProductService, Product } from '../services/product.service';
import { OrderAvailabilityService } from '../services/order-availability.service';
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

  // Controls whether to display the company logo (assets/company-logo.png)
  showLogo = true;

  readonly products = signal<Product[]>([]);

  orderMessage = signal('');
  searchTerm = signal('');
  productQuantities = signal<Record<string, number>>({});

  getQuantity(productId: string): number {
    return this.productQuantities()[productId] ?? 1;
  }

  changeQuantity(productId: string, delta: number): void {
    const product = this.products().find((item) => item.id === productId);
    if (!product) {
      return;
    }

    const stock = Number(product.quantity ?? 0);
    const current = this.getQuantity(productId);
    const next = Math.max(1, current + delta);
    const limitedNext = Math.min(next, stock || 1);

    this.productQuantities.update((state) => ({
      ...state,
      [productId]: limitedNext,
    }));
  }

  readonly filteredProducts = computed(() => {
    const query = this.searchTerm().trim().toLowerCase();
    const availableProducts = this.products().filter((product) => product.available);

    if (!query) {
      return availableProducts;
    }

    return availableProducts.filter((product) => {
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
  private orderAvailabilityService = inject(OrderAvailabilityService);

  get ordersEnabled(): boolean {
    return this.orderAvailabilityService.enabled();
  }

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
    if (!this.orderAvailabilityService.enabled()) {
      this.showOrderDisabledDialog();
      return;
    }

    const stock = Number(product.quantity ?? 0);
    const quantity = Math.min(this.getQuantity(product.id), stock || 1);
    const existingItem = this.cart().find((item) => item.id === product.id);

    if (quantity <= 0) {
      this.orderMessage.set(`${product.name} no tiene stock disponible`);
      return;
    }

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

  private showOrderDisabledDialog(): void {
    this.dialog.open(OrderDisabledDialogComponent, {
      width: '480px',
    });
  }

  openCart(): void {
    const dialogRef = this.dialog.open(CartModalComponent, {
      data: {
        items: [...this.cart()],
        onClear: () => {
          this.cart.set([]);
          this.dialog.closeAll();
        },
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result?.success && result.customer && result.items?.length > 0) {
        const order = {
          customer: result.customer,
          items: result.items.map((item: CartItem) => ({
            productId: item.id,
            quantity: item.quantity,
            price: item.price,
          })),
          total: result.items.reduce((sum: number, item: CartItem) => sum + item.price * item.quantity, 0),
        };

        this.orderService.createOrder(order).subscribe({
          next: () => {
            this.orderMessage.set('Pedido creado correctamente');
            this.cart.set([]);
            this.loadProducts();
          },
          error: () => {
            this.orderMessage.set('Error creando el pedido');
          },
        });
      }
    });
  }

  logoLoadError(): void {
    this.showLogo = false;
  }
}
