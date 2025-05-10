import { clerkMiddleware } from '@clerk/nextjs/server';

export default clerkMiddleware();

export const config = {
  matcher: [
    // proteger páginas y APIs excepto la ruta de webhook
    '/((?!_next|api/webhooks).*)',
    '/api/:path((?!webhooks).*)',
  ],
};
