// Manual carrier: the store arranges the carrier itself and records the tracking number by hand
// (Fulfil order → manual fulfilment). It has no carrier API, so it never invents rates, labels,
// tracking events or address checks; each operation says so instead.
const unsupported = (what: string) => {
  throw new Error(`The manual carrier does not provide ${what}. Record the carrier and tracking number when you fulfil the order.`);
};

export async function getRatesFunction(_input: { provider: any; order: any }) {
  return [];
}

export async function createLabelFunction(_input: { provider: any; order: any; rate: any }) {
  return unsupported("shipping labels");
}

export async function validateAddressFunction(_input: { provider: any; address: any }) {
  return unsupported("address validation");
}

export async function trackShipmentFunction(_input: { provider: any; trackingNumber: string }) {
  return unsupported("tracking events");
}

export async function cancelLabelFunction(_input: { provider: any; labelId: string }) {
  return unsupported("label cancellation");
}
