import { TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { of } from 'rxjs';
import { AdminProductDialogComponent } from './admin-product-dialog.component';
import { ProductService } from '../services/product.service';

describe('AdminProductDialogComponent', () => {
  let component: AdminProductDialogComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminProductDialogComponent],
      providers: [
        { provide: MatDialogRef, useValue: { close: () => undefined } },
        { provide: MAT_DIALOG_DATA, useValue: { product: {}, mode: 'create' } },
        {
          provide: ProductService,
          useValue: {
            findCategories: () => of([]),
            createProduct: () => of({}),
            update: () => of({}),
          },
        },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(AdminProductDialogComponent);
    component = fixture.componentInstance;
  });

  it('should include quantity and expirationDate in the form data payload', () => {
    component.product = {
      name: 'Producto prueba',
      category: 'Bebidas',
      price: 1000,
      quantity: 5,
      expirationDate: '2026-12-31',
    };

    const formData = component['buildProductFormData']();

    expect(formData.get('quantity')).toBe('5');
    expect(formData.get('expirationDate')).toBe('2026-12-31');
  });
});
