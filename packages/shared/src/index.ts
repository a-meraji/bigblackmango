// @blackmango/shared — shared platform consumed by the customer and admin apps.
// Apps resolve shared modules via path aliases (@components, @api, @store, …) to source,
// so this barrel is intentionally minimal; it exists only to satisfy the package `main`
// and to provide a stable entry if the package is ever consumed by name.
export { queryClient } from './query-client';
