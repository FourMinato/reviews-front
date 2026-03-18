import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const userData = sessionStorage.getItem('auth_user');
  let uid = '';

  if (userData) {
    try {
      const parsed = JSON.parse(userData);
      uid = parsed?.uid || '';
    } catch (e) {
      console.error('Error parsing auth_user from sessionStorage', e);
    }
  }

  if (uid) {
    const authReq = req.clone({
      setHeaders: {
        'x-uid': String(uid)
      }
    });
    return next(authReq);
  }

  return next(req);
};
