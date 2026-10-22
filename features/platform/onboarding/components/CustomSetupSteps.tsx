import React, { useState } from "react";
import { Copy, Check, Clipboard, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DataCard } from "./DataCard";
import seedData from "@/features/platform/onboarding/lib/seed.json";

interface CustomSetupStepsProps {
  currentJson?: any;
  onJsonUpdate?: (newJson: any) => void;
  onBack?: () => void;
}

function useCopyToClipboard(): [
  string | null,
  (text: string) => Promise<boolean>
] {
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const copy = React.useCallback(async (text: string) => {
    if (!navigator?.clipboard) {
      console.warn("Clipboard not supported");
      return false;
    }

    try {
      await navigator.clipboard.writeText(text);
      setCopiedText(text);
      return true;
    } catch (error) {
      console.warn("Copy failed", error);
      setCopiedText(null);
      return false;
    }
  }, []);

  return [copiedText, copy];
}

// Get complete setup configuration from seed data
function getCompleteSetupJson() {
  const completeRegionCodes = ["us"];
  const completePaymentProviders = ["pp_system_default"];
  const completeShipping = [
    "Standard Shipping",
    "Express Shipping",
    "Return Shipping",
  ];
  const completeCategories = ["devices", "e-liquids", "pods-coils", "accessories"];
  const completeCollections = ["starter-kits", "new-arrivals", "best-sellers"];
  const completeProducts = [
    "nova-pod-kit",
    "stratus-starter-kit",
    "apex-80w-box-mod",
    "classic-tobacco-e-liquid",
    "cool-menthol-e-liquid",
    "tobacco-reserve-nicotine-salt",
    "nova-replacement-pods",
    "apex-mesh-coils",
    "device-carry-case",
    "usb-c-charging-cable",
  ];

  // Filter products and clean up variant prices to only include relevant regions
  const filteredProducts = (seedData.products as any[])
    .filter((p: any) => completeProducts.includes(p.handle))
    .map((product: any) => ({
      ...product,
      variants: product.variants.map((variant: any) => ({
        ...variant,
        prices: variant.prices.filter((price: any) =>
          completeRegionCodes.includes(price.regionCode)
        ),
      })),
    }));

  return {
    store: {
      name: "Cloud Nine Vapor",
      defaultCurrencyCode: "usd",
      homepageTitle: "Vape devices, e-liquids and accessories",
      homepageDescription: "Adults 21+ only. Shop devices, e-liquids and accessories.",
    },
    regions: (seedData.regions as any[]).filter((r: any) =>
      completeRegionCodes.includes(r.code)
    ),
    paymentProviders: (seedData.paymentProviders as any[]).filter((p: any) =>
      completePaymentProviders.includes(p.code)
    ),
    shipping_options: (seedData.shipping_options as any[]).filter((s: any) =>
      completeShipping.includes(s.name)
    ),
    categories: (seedData.categories as any[]).filter((c: any) =>
      completeCategories.includes(c.handle)
    ),
    collections: (seedData.collections as any[]).filter((c: any) =>
      completeCollections.includes(c.handle)
    ),
    products: filteredProducts,
  };
}

export function CustomSetupSteps({
  currentJson,
  onJsonUpdate = () => {},
  onBack,
}: CustomSetupStepsProps) {
  const [, copy] = useCopyToClipboard();
  const [copiedItems, setCopiedItems] = useState<Record<string, boolean>>({});
  const [customJson, setCustomJson] = useState("");
  const [jsonError, setJsonError] = useState("");

  // Use complete setup JSON as the base
  const completeJson = getCompleteSetupJson();

  const copyToClipboard = async (text: string, itemKey: string) => {
    try {
      const success = await copy(text);
      if (success) {
        setCopiedItems((prev) => ({ ...prev, [itemKey]: true }));
        setTimeout(() => {
          setCopiedItems((prev) => ({ ...prev, [itemKey]: false }));
        }, 2000);
      }
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  // Generate the AI prompt focused on user questions rather than editing existing JSON
  const generateAIPrompt = () => {
    return `I need help customizing my vape store configuration. I've pasted my current set up.

**Your first response should be:**

Start by telling me what this JSON configuration currently contains:

**STORE INFORMATION:**
- Store Name: Cloud Nine Vapor
- Default Currency: USD
- Homepage Title: Vape devices, e-liquids and accessories
- Homepage Description: Adults 21+ only. Shop devices, e-liquids and accessories.

**REGIONS & CURRENCIES:**
- United States (USD, $) - United States - 0% tax rate

**PAYMENT PROVIDERS:**
- Manual Payment (manual payment)

**SHIPPING OPTIONS:**
- Standard Shipping: $10.00
- Express Shipping: $20.00
- Return Shipping: $10.00

**PRODUCT CATEGORIES:**
- Devices, E-Liquids, Pods & Coils, Accessories

**COLLECTIONS:**
- Starter Kits, New Arrivals, Best Sellers

**PRODUCTS (10 items):**
- Nova Pod Kit
- Stratus Starter Kit
- Apex 80W Box Mod
- Classic Tobacco E-Liquid
- Cool Menthol E-Liquid
- Tobacco Reserve Nicotine Salt
- Nova Replacement Pods (2-Pack)
- Apex Mesh Coils (5-Pack)
- Device Carry Case
- USB-C Charging Cable

Then ask: "This is what your store configuration currently has. What would you like to change? 
As the user provides more chnages to the JSON, keep aksing what changes and once the user is finishedand indicates they are done, return the JSON and tell them to paste it into Openfront."

After I tell you what to change, modify the JSON and provide the complete updated configuration for me to paste into Openfront.`;
  };

  const [jsonApplied, setJsonApplied] = useState(false);

  const validateAndApplyJson = () => {
    try {
      const parsed = JSON.parse(customJson);

      const requiredKeys = [
        "store",
        "regions",
        "paymentProviders",
        "shipping_options",
        "categories",
        "products",
      ];
      const missingKeys = requiredKeys.filter((key) => {
        if (key === "store") {
          return !parsed[key] || typeof parsed[key] !== "object";
        }
        return !parsed[key] || !Array.isArray(parsed[key]);
      });

      if (missingKeys.length > 0) {
        setJsonError(`Missing required keys: ${missingKeys.join(", ")}`);
        return;
      }

      onJsonUpdate(parsed);
      setJsonApplied(true);
      setJsonError("");
    } catch (err) {
      setJsonError("Invalid JSON format. Please check your syntax.");
    }
  };

  const steps = [
    {
      number: 1,
      title: "Copy Base Configuration",
      description: "Start with our complete template JSON configuration",
      content: (
        <DataCard
          title="Onboarding Data"
          content={JSON.stringify(completeJson, null, 2)}
          onCopy={copyToClipboard}
          copied={copiedItems.json || false}
          copyKey="json"
        />
      ),
    },
    {
      number: 2,
      title: "Copy AI Customization Prompt",
      description:
        "Use this prompt with any AI assistant to get your custom configuration",
      content: (
        <DataCard
          title="AI Prompt"
          content={generateAIPrompt()}
          onCopy={copyToClipboard}
          copied={copiedItems.prompt || false}
          copyKey="prompt"
        />
      ),
    },
    {
      number: 3,
      title: "Chat with AI",
      description:
        "The AI will ask you questions about your business and products, what regions you want to sell in, and help you customize your setup",
      content: null,
    },
    {
      number: 4,
      title: "Paste Your Custom JSON",
      description: "Paste the AI-generated configuration here",
      content: (
        <div className="overflow-hidden rounded-xl bg-muted/40 ring-1 ring-inset ring-border/60">
          <div className="flex items-center justify-between border-b border-border px-4 py-1.5">
            <span className="text-xs font-semibold text-foreground">
              Custom Onboarding Data
            </span>
            <Button
              size="sm"
              variant="ghost"
              onClick={async () => {
                try {
                  const text = await navigator.clipboard.readText();
                  setCustomJson(text);
                  setJsonError("");
                } catch (err) {
                  console.error("Failed to paste:", err);
                }
              }}
              aria-label="Paste"
              className="size-8 rounded-full p-0 hover:bg-background/80"
            >
              <Clipboard className="h-3 w-3 text-muted-foreground" />
            </Button>
          </div>
          <div className="bg-background/60">
            <Textarea
              placeholder="Paste your customized JSON configuration here..."
              value={customJson}
              onChange={(e) => {
                setCustomJson(e.target.value);
                setJsonError("");
              }}
              className="min-h-[200px] font-mono text-xs resize-none border-0 bg-transparent focus:outline-none p-4 rounded-none"
            />
          </div>
          {jsonError && (
            <div className="px-4 pb-4">
              <div role="alert" className="rounded-lg bg-destructive/10 p-2 ring-1 ring-inset ring-destructive/20">
                <p className="text-xs text-destructive">{jsonError}</p>
              </div>
            </div>
          )}
          <div className="flex items-center justify-end border-t border-border px-3 py-2">
            <Button
              size="sm"
              className="h-10 rounded-full px-4 sm:h-8"
              onClick={validateAndApplyJson}
              disabled={!customJson.trim()}
            >
              Apply Configuration
            </Button>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {jsonApplied && onBack && (
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setJsonApplied(false);
              onBack();
            }}
            className="h-10 rounded-full px-3"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Custom Setup
          </Button>
        </div>
      )}

      <Label className="text-sm font-semibold">
        Custom Setup Configuration
      </Label>

      <div className="space-y-0">
        {steps.map((step, index) => (
          <div key={step.number} className="relative">
            {/* Connecting line between sections */}
            {index < steps.length - 1 && (
              <div className="absolute left-3 top-3 bottom-0 w-[1px] bg-border"></div>
            )}

            {/* Section header with number badge */}
            <div className="flex items-center space-x-3 mb-2 relative">
              <div className="z-10 inline-flex size-6 items-center justify-center rounded-full bg-muted font-mono text-[11px] tabular-nums text-foreground shadow-[inset_0_1px_2px_rgb(0_0_0/0.06)] ring-1 ring-inset ring-border/60">
                {String(step.number).padStart(2, '0')}
              </div>
              <Label className="text-sm font-semibold text-foreground">
                {step.title}
              </Label>
            </div>

            {/* Section items */}
            <div className="pl-9">
              <div className="pb-6">
                <p className={`text-xs text-muted-foreground ${step.content ? 'mb-3' : ''}`}>
                  {step.description}
                </p>
                {step.content}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
