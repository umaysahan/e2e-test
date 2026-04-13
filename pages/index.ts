/**
 * Barrel export — import all page objects from one place.
 * Usage: import { LoginPage, InventoryPage } from '@pages/index.js';
 */
export { LoginPage } from './login.page.js';
export { InventoryPage, type SortOption } from './inventory.page.js';
export { CartPage, type CartItem } from './cart.page.js';
export { CheckoutPage, type CheckoutInfo } from './checkout.page.js';
export { CheckoutCompletePage } from './checkout-complete.page.js';
export { HeaderComponent } from './components/header.component.js';
export { ProductCardComponent } from './components/product-card.component.js';
