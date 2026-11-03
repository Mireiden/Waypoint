import { inject } from '@angular/core';
import { Router } from '@angular/router';
import type { CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const adminGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  const user = auth.currentUser();
  if (user === null) return router.createUrlTree(['/auth']);
  if (user.role !== 'admin') return router.createUrlTree(['/map']);
  return true;
};
