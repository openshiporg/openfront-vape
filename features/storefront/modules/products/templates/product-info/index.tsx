import LocalizedClientLink from "../../../common/components/localized-client-link"
import { DocumentRenderer } from "./DocumentRenderer"

type ProductDescription = {
  document?: any;
} | string | null;

type ProductCollectionInfo = {
  handle?: string | null;
  title?: string | null;
};

type ProductInfoType = {
  title?: string | null;
  description?: ProductDescription;
  productCollections?: ProductCollectionInfo[] | null;
};

type ProductInfoProps = {
  product: ProductInfoType;
};
const renderers = {
  inline: {
    link: ({ children, href }: { children: React.ReactNode, href: string }) => {
      if (href.startsWith("/")) {
        return (
          <LocalizedClientLink
            href={href}
            className="text-vp-ink underline decoration-vp-line underline-offset-4 hover:decoration-vp-ink"
          >
            {children}
          </LocalizedClientLink>
        )
      }

      return (
        <a
          href={href}
          className="text-vp-ink underline decoration-vp-line underline-offset-4 hover:decoration-vp-ink"
        >
          {children}
        </a>
      )
    },
    bold: ({ children }: { children: React.ReactNode }) => {
      return <span className="font-semibold">{children}</span>
    }
  },
  block: {
    heading: ({ children, level }: { children: React.ReactNode, level: number }) => {
      const sizes: Record<number, string> = {
        1: "text-3xl",
        2: "text-2xl",
        3: "text-xl",
        4: "text-lg",
        5: "text-base",
        6: "text-sm"
      }

      const HeadingTag = `h${level}` as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
      return (
        <HeadingTag
          className={`${sizes[level]} leading-tight font-semibold text-vp-ink mb-2`}
        >
          {children}
        </HeadingTag>
      )
    },
    paragraph: ({ children, textAlign }: { children: React.ReactNode, textAlign?: string }) => {
      return (
        <p // Replaced Text with p
          className={`text-vp-ink-2 mb-3 last:mb-0 ${
            textAlign ? `text-${textAlign}` : ''
          }`}
        >
          {children}
        </p>
      )
    },
    blockquote: ({ children }: { children: React.ReactNode }) => {
      return (
        <blockquote className="border-l-2 border-vp-line pl-4 my-4">
          <p className="text-vp-ink-2">{children}</p>
        </blockquote>
      )
    },
    list: ({ children, type }: { children: React.ReactNode[], type: "ordered" | "unordered" }) => {
      const List = type === "ordered" ? "ol" : "ul"

      return (
        <List className={`${type === "ordered" ? "list-decimal" : "list-disc"} pl-5 text-vp-ink-2 space-y-1 mb-3`}>
          {children.map((x, i) => (
            <li key={i}>{x}</li>
          ))}
        </List>
      )
    },
  }
}

const ProductInfo = ({ product }: ProductInfoProps) => {
  const hasDescription =
    (typeof product.description === "string" && product.description.trim()) ||
    (typeof product.description === "object" && product.description?.document)

  if (!hasDescription) return null

  return (
    <section id="product-info" className="flex flex-col gap-3 border-t border-vp-line pt-6">
      <h2 className="text-[13px] font-medium text-vp-ink">Details</h2>
      <div className="text-[15px] leading-[24px]" data-testid="product-description">
        {typeof product.description === "string" ? (
          <p className="whitespace-pre-line text-vp-ink-2">{product.description}</p>
        ) : product.description?.document ? (
          <DocumentRenderer document={product.description.document} renderers={renderers} />
        ) : null}
      </div>
    </section>
  )
}

export default ProductInfo
