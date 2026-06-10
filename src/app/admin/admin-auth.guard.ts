import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { map } from 'rxjs/operators';
import { AdminLoginDialogComponent } from './admin-login-dialog.component';

export const adminAuthGuard: CanActivateFn = () => {
  const dialog = inject(MatDialog);
  const router = inject(Router);

  const dialogRef = dialog.open(AdminLoginDialogComponent, {
    width: '420px',
    disableClose: true,
  });

  return dialogRef.afterClosed().pipe(
    map((allowed) => {
      if (allowed) {
        return true;
      }
      router.navigate(['/']);
      return false;
    })
  );
};
