// Native createCart is mediated by cart-command; guests use createActiveCart.
// This obsolete unregistered helper must not become a sudo creation bypass.
export default async function createCart(_root: unknown, _args: unknown, _context: unknown): Promise<never> {
  throw new Error('Use the controlled active-cart creation workflow');
}
