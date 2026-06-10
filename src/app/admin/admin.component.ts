import { Component, computed, inject, signal, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Router } from '@angular/router';
import { Product, ProductService, Category } from '../services/product.service';
import { Order, OrderService, OrderState } from '../services/order.service';
import { OrderAvailabilityService } from '../services/order-availability.service';
import { AdminOrderDialogComponent } from './admin-order-dialog.component';
import { AdminProductDialogComponent } from './admin-product-dialog.component';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss'],
})
export class AdminComponent implements OnDestroy {
  readonly orders = signal<Order[]>([]);
  readonly products = signal<Product[]>([]);
  readonly categories = signal<Category[]>([]);
  readonly actionMessage = signal('');
  readonly productSearch = signal('');
  readonly filteredProducts = computed(() => {
    const query = this.productSearch().trim().toLowerCase();
    if (!query) {
      return this.products();
    }

    return this.products().filter((product) => {
      const name = product.name?.toLowerCase() ?? '';
      const category = product.category?.toLowerCase() ?? '';
      const description = product.description?.toLowerCase() ?? '';
      const invoice = product.idInvoice?.toLowerCase() ?? '';
      return (
        name.includes(query) ||
        category.includes(query) ||
        description.includes(query) ||
        invoice.includes(query)
      );
    });
  });
  newCategoryName = '';
  readonly orderStates: OrderState[] = ['CREATED', 'PROCESSING', 'COMPLETED', 'CANCELLED'];

  private previousOrderIds = new Set<string>();
  private orderRefreshInterval?: number;

  private readonly orderService = inject(OrderService);
  private readonly productService = inject(ProductService);
  private readonly orderAvailabilityService = inject(OrderAvailabilityService);
  private readonly dialog = inject(MatDialog);
  private readonly router = inject(Router);

  constructor() {
    this.loadOrders();
    this.startOrderPolling();
    this.loadProducts();
    this.loadCategories();
  }

  get ordersEnabled(): boolean {
    return this.orderAvailabilityService.enabled();
  }

  toggleOrderAcceptance(): void {
    this.orderAvailabilityService.toggle();
    this.actionMessage.set(
      this.ordersEnabled
        ? 'Ahora se permiten pedidos.'
        : 'Se han deshabilitado los pedidos para los clientes.'
    );
  }

  private loadOrders(): void {
    this.orderService.findAll().subscribe({
      next: (orders) => {
        this.updateOrderList(orders);
        this.actionMessage.set('');
      },
      error: () => {
        this.actionMessage.set('No se pudieron cargar los pedidos');
      },
    });
  }

  private updateOrderList(orders: Order[]): void {
    const sorted = [...orders].sort((a, b) => {
      const ta = a.createDate ? Date.parse(a.createDate) : 0;
      const tb = b.createDate ? Date.parse(b.createDate) : 0;
      if (tb !== ta) return tb - ta;
      const ka = this.getOrderKey(a) ?? '';
      const kb = this.getOrderKey(b) ?? '';
      return kb.localeCompare(ka);
    });

    const orderKeys = new Set(sorted.map((order) => this.getOrderKey(order)).filter((id): id is string => !!id));
    const isInitialLoad = this.previousOrderIds.size === 0;
    const hasNewOrder = !isInitialLoad && [...orderKeys].some((id) => !this.previousOrderIds.has(id));

    if (hasNewOrder) {
      this.playOrderNotificationSound();
    }

    this.previousOrderIds = orderKeys;
    this.orders.set(sorted);
  }

  private getOrderKey(order: Order): string | undefined {
    if (!order.id) {
      return undefined;
    }
    return typeof order.id === 'string' ? order.id : JSON.stringify(order.id);
  }

  private startOrderPolling(): void {
    if (typeof window === 'undefined') {
      return;
    }

    this.orderRefreshInterval = window.setInterval(() => this.loadOrders(), 20000);
  }

  ngOnDestroy(): void {
    if (this.orderRefreshInterval) {
      clearInterval(this.orderRefreshInterval);
    }
  }

  private playOrderNotificationSound(): void {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      const AudioContext = (window as any).AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) {
        return;
      }

      const audioCtx = new AudioContext();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(720, audioCtx.currentTime);
      gainNode.gain.setValueAtTime(0.15, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.25);

      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.25);
    } catch {
      // si el navegador no permite audio automático, se ignora.
    }
  }

  openOrder(order: Order): void {
    this.dialog.open(AdminOrderDialogComponent, {
      data: order,
      width: '760px',
    });
  }

  openCreateProduct(): void {
    const dialogRef = this.dialog.open(AdminProductDialogComponent, {
      data: { product: { available: true, category: '', name: '', price: 0 } as Partial<Product>, mode: 'create' },
      width: '640px',
    });

    dialogRef.afterClosed().subscribe((createdProduct: Product | undefined) => {
      if (createdProduct) {
        this.products.update((products) => [...products, createdProduct]);
      }
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

  markDelivered(order: Order, event: Event): void {
    event.stopPropagation();
    if (!order.id || order.state === 'DELIVERED') {
      return;
    }

    this.orderService.updateStatus(order.id, 'DELIVERED').subscribe({
      next: () => {
        this.orders.update((orders) =>
          orders.map((item) => (item.id === order.id ? { ...item, state: 'DELIVERED' } : item))
        );
        this.actionMessage.set(`Pedido ${order.id} marcado como entregado`);
      },
      error: () => {
        this.actionMessage.set('No se pudo marcar el pedido como entregado');
      },
    });
  }

  private loadProducts(): void {
    this.productService.findAll().subscribe({
      next: (products) => this.products.set(products),
      error: () => this.actionMessage.set('No se pudieron cargar los productos'),
    });
  }

  private getCategoryId(category: Category): string | undefined {
    const rawId = category.id ?? category._id;
    if (!rawId) {
      return undefined;
    }
    if (typeof rawId === 'string') {
      return rawId;
    }
    if (typeof rawId === 'object' && rawId !== null) {
      if ('$oid' in rawId && typeof rawId['$oid'] === 'string') {
        return rawId['$oid'];
      }
      if ('oid' in rawId && typeof rawId['oid'] === 'string') {
        return rawId['oid'];
      }
      if ('id' in rawId && typeof rawId['id'] === 'string') {
        return rawId['id'];
      }
      if ('timestamp' in rawId && typeof rawId['timestamp'] === 'number') {
        return rawId['timestamp'].toString();
      }
      if ('date' in rawId && typeof rawId['date'] === 'string') {
        return rawId['date'];
      }
      return JSON.stringify(rawId);
    }
    return undefined;
  }

  private normalizeCategory(category: Category): Category {
    return {
      ...category,
      id: this.getCategoryId(category),
    };
  }

  private loadCategories(): void {
    this.productService.findCategories().subscribe({
      next: (categories) => this.categories.set(categories.map((category) => this.normalizeCategory(category))),
      error: () => this.actionMessage.set('No se pudieron cargar las categorías'),
    });
  }

  createCategory(): void {
    const categoryName = this.newCategoryName.trim();
    if (!categoryName) {
      return;
    }

    this.productService.createCategory(categoryName).subscribe({
      next: (category) => {
        this.categories.update((list) => [...list, this.normalizeCategory(category)]);
        this.actionMessage.set(`Categoría ${category.categoryName} creada`);
        this.newCategoryName = '';
      },
      error: () => this.actionMessage.set('No se pudo crear la categoría'),
    });
  }

  deleteCategory(category: Category): void {
    const categoryId = this.getCategoryId(category);
    if (!categoryId) {
      console.warn('[AdminComponent] deleteCategory skipped because no valid category id was found', category);
      return;
    }

    this.productService.deleteCategory(categoryId).subscribe({
      next: () => {
        this.categories.update((list) => list.filter((item) => item.id !== categoryId));
        this.actionMessage.set(`Categoría ${category.categoryName} eliminada`);
      },
      error: () => this.actionMessage.set('No se pudo eliminar la categoría'),
    });
  }

  openEditProduct(product: Product): void {
    const dialogRef = this.dialog.open(AdminProductDialogComponent, {
      data: { product: { ...product }, mode: 'edit' },
      width: '640px',
    });

    dialogRef.afterClosed().subscribe((updatedProduct: Product | undefined) => {
      if (updatedProduct) {
        this.products.update((products) =>
          products.map((item) => (item.id === updatedProduct.id ? updatedProduct : item))
        );
      }
    });
  }

  deleteProduct(product: Product): void {
    this.productService.deleteProduct(product.id).subscribe({
      next: () => {
        this.products.update((products) => products.filter((item) => item.id !== product.id));
        this.actionMessage.set(`Producto ${product.name} eliminado.`);
      },
      error: () => {
        this.actionMessage.set('No se pudo eliminar el producto');
      },
    });
  }

  getItemCount(order: Order): number {
    return order.items.reduce((sum, item) => sum + (item.amount ?? item.quantity ?? 0), 0);
  }

  getSalePrice(product: Product): number {
    const price = Number(product.price ?? 0);
    const margin = Number(product.profitMargin ?? 0);
    return price + price * margin / 100;
  }

  formatTotal(order: Order): number {
    return (
      order.total ??
      order.items.reduce(
        (sum, item) =>
          sum +
          (item.subTotal ?? ((item.unitPrice ?? item.price ?? 0) * (item.amount ?? item.quantity ?? 0))),
        0
      )
    );
  }

  get pendingOrdersCount(): number {
    return this.orders().filter((order) => order.state !== 'COMPLETED').length;
  }

  get availableProductsCount(): number {
    return this.products().filter((product) => product.available).length;
  }

  get outOfStockCount(): number {
    return this.products().filter((product) => !product.available).length;
  }
}
