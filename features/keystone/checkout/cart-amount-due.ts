import { allocateGiftCards, GIFT_CARD_QUERY, type GiftCardAllocation } from "./gift-card-tender";

export const CART_GIFT_CARD_SELECTION = GIFT_CARD_QUERY;

/**
 * Call once the gross `cart.rawTotal` is final (regulated tax already added). Applies the cart's gift
 * cards and leaves `rawTotal` as the amount the card processor must collect. Balances are only read here;
 * they are debited at checkout by holdGiftCards.
 */
export function applyGiftCardsToCart(cart: any): { grossTotal: number; giftCardAllocation: GiftCardAllocation } {
  const allocation = allocateGiftCards(cart.giftCards, cart.rawTotal, cart.region?.id);
  const target = cart as any;
  target.grossTotal = allocation.gross;
  target.giftCardAllocation = allocation;
  target.rawTotal = allocation.due;
  return { grossTotal: allocation.gross, giftCardAllocation: allocation };
}
