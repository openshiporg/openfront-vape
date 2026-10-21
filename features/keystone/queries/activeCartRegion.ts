import type { KeystoneContext } from '@keystone-6/core/types';

async function activeCartRegion(_root: unknown, { countryCode }: { countryCode: string }, context: KeystoneContext<any>) {
  if (!/^[a-z]{2}$/i.test(countryCode)) return null;
  const sudoContext = context.sudo();

  // Find region by country code
  const regions = await sudoContext.query.Region.findMany({
    take: 1,
    where: { 
      countries: { 
        some: { 
          iso2: { equals: countryCode.toLowerCase() } 
        } 
      } 
    },
    query: `
      id
      name
      currency {
        code
        noDivisionCurrency
      }
      countries {
        id
        name
        iso2
      }
      paymentProviders {
        id
        code
        isInstalled
      }
      shippingOptions {
        id
        name
        amount
        priceType
      }
    `
  });

  return regions[0] || null;
}

export default activeCartRegion; 