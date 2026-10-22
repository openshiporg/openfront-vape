import ItemsTemplate from "./items"
import Summary from "./summary"
import EmptyCartMessage from "../components/empty-cart-message"
import SignInPrompt from "../components/sign-in-prompt"

interface CartTemplateProps {
  cart?: {
    id: string;
    lineItems: any[];
    region: any;
  };
  user: any;
}

const CartTemplate = ({ cart, user }: CartTemplateProps) => {
  const count = cart?.lineItems?.reduce((acc: number, item: any) => acc + (item.quantity || 0), 0) || 0

  return (
    <div className="mx-auto w-full max-w-[1320px] px-4 pt-8 pb-16 sm:px-6 sm:pt-12" data-testid="cart-container">
      {cart?.lineItems?.length ? (
        <>
          <header className="flex items-baseline gap-3">
            <h1 className="text-[36px] leading-[40px] font-semibold tracking-[-0.03em] text-vp-ink sm:text-[52px] sm:leading-[56px]">
              Bag
            </h1>
            <span className="font-vp-mono text-[14px] text-vp-ink-3">
              {count} {count === 1 ? "item" : "items"}
            </span>
          </header>
          <div className="mt-6 grid grid-cols-1 gap-6 sm:mt-8 lg:grid-cols-[minmax(0,1fr)_400px] lg:gap-12">
            <div className="flex min-w-0 flex-col gap-4">
              <ItemsTemplate items={cart.lineItems} region={cart.region} />
              {!user && <SignInPrompt />}
            </div>
            <div className="relative">
              {cart && cart.region && (
                <aside className="rounded-[22px] border border-vp-line bg-vp-surface p-5 sm:p-6 lg:sticky lg:top-6">
                  <Summary cart={cart} />
                </aside>
              )}
            </div>
          </div>
        </>
      ) : (
        <EmptyCartMessage />
      )}
    </div>
  )
}

export default CartTemplate
