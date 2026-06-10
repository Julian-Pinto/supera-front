import { Routes } from '@angular/router';
import { CatalogComponent } from './catalog/catalog.component';
import { AdminComponent } from './admin/admin.component';
import { AdminLoginComponent } from './admin/admin-login.component';
import { adminAuthGuard } from './admin/admin-auth.guard';

export const routes: Routes = [
  {
    path: '',
    component: CatalogComponent,
  },
  {
    path: 'login',
    component: AdminLoginComponent,
  },
  {
    path: 'admin',
    component: AdminComponent,
    canActivate: [adminAuthGuard],
  },
];
