import { createBrowserRouter } from 'react-router-dom';

// Routes are added incrementally in each phase.
// Phase 1: design system primitives (no routes)
// Phase 2: /auth/otp + RequireAuth/RequireAdmin guards
// Phase 3: / (CustomerLayout + HomePage)
// Phase 4: /foods/:foodId, /party-services/:serviceId
// Phase 5: /checkout
// Phase 6: /payment, /payment/callback, /orders
// Phase 7+: /admin/*

export const router = createBrowserRouter([
  // placeholder — will be replaced in Phase 2
  {
    path: '*',
    element: null,
  },
]);
