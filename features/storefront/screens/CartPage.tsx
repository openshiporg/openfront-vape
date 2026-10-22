import CartTemplate from "@/features/storefront/modules/cart/templates"
import { retrieveCart } from "@/features/storefront/lib/data/cart"
import { getUser } from "@/features/storefront/lib/data/user"
import SkeletonCartPage from "@/features/storefront/modules/skeletons/templates/skeleton-cart-page"
import InteractiveLink from "@/features/storefront/modules/common/components/interactive-link"

export const metadata = {
  title: "Cart",
  description: "View your cart",
}

export async function CartPage() {
  const cart = await retrieveCart()
  const user = await getUser()

  return <CartTemplate cart={cart} user={user} />
}

export function CartLoading() {
  return <SkeletonCartPage />
}

export function CartNotFound() {
  return (
    <div className="mx-auto flex min-h-[60vh] w-full max-w-[1320px] flex-col justify-center gap-4 px-4 py-24 sm:px-6">
      <span className="font-vp-mono text-[13px] text-vp-ink-3">404</span>
      <h1 className="text-[40px] leading-[44px] font-semibold tracking-[-0.02em] text-vp-ink">Bag not found</h1>
      <p className="text-[15px] leading-[24px] text-vp-ink-2">This bag no longer exists. Clear your cookies and try again.</p>
      <div className="mt-4">
        <InteractiveLink href="/">Back to home</InteractiveLink>
      </div>
    </div>
  )
}
