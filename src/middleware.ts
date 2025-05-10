import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

// Rutas protegidas donde los usuarios deben estar autenticados
const isProtectedRoute = createRouteMatcher(['/'])

// Rutas públicas que deben ser accesibles sin autenticación
const isPublicRoute = createRouteMatcher([
  '/api/webhooks(.*)', 
  '/api/update-db-structure'
])

export default clerkMiddleware(async (auth, req) => {
  // Si es una ruta pública, permitir acceso sin autenticación
  if (isPublicRoute(req)) {
    return;
  }
  
  // Si es una ruta protegida, requerir autenticación
  if (isProtectedRoute(req)) {
    await auth.protect();
  }
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}