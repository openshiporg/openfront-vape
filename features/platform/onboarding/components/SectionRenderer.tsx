import React from 'react';
import { Label } from '@/components/ui/label';
import { SectionItem } from './SectionItem';
import { SectionDefinition } from '../config/templates';
import { getItemsFromJsonData } from '../utils/dataUtils';
import type { OnboardingPlan, OnboardingPlanKey } from '../hooks/useOnboardingApi';

const PROVIDER_ENV_VARS: Record<string, string[]> = {
  Stripe: ['NEXT_PUBLIC_STRIPE_KEY', 'STRIPE_SECRET_KEY'],
  PayPal: ['NEXT_PUBLIC_PAYPAL_CLIENT_ID', 'PAYPAL_CLIENT_SECRET'],
};

// What happens to the records this run would not add.
function planStateLabel(section: OnboardingPlan['sections'][OnboardingPlanKey]): string | null {
  const kept = section.existing.length;
  if (section.skipped) return 'Skipped, sales are disabled';
  if (section.add.length === 0 && kept > 0) return 'Already set up';
  if (kept > 0) return `${kept} already exist`;
  if (section.add.length === 0) return 'None';
  return null;
}

interface SectionRendererProps {
  sections: SectionDefinition[];
  selectedTemplate: 'full' | 'minimal' | 'custom';
  isLoading: boolean;
  loadingItems: Record<string, string[]>;
  completedItems: Record<string, string[]>;
  itemErrors: Record<string, Record<string, string>>;
  error: string | null;
  step: 'template' | 'progress' | 'done';
  currentJsonData?: any;
  // When present, the preview shows only what this run would add.
  plan?: OnboardingPlan | null;
}

export const SectionRenderer: React.FC<SectionRendererProps> = ({
  sections,
  selectedTemplate,
  isLoading,
  loadingItems,
  completedItems,
  itemErrors,
  error,
  step,
  currentJsonData,
  plan,
}) => {
  return (
    <div className="space-y-0">
      {sections.map((section, idx) => {
        const isLastItem = idx === sections.length - 1;
        const planSection = plan?.sections[section.type as OnboardingPlanKey];
        const items = planSection
          ? planSection.add
          : currentJsonData
          ? getItemsFromJsonData(currentJsonData, section.type)
          : [];
        const planLabel = planSection ? planStateLabel(planSection) : null;

        return (
          <div key={section.type} className="relative">
            {/* Connecting line between sections */}
            {!isLastItem && (
              <div className="absolute left-3 top-3 bottom-0 w-[1px] bg-border"></div>
            )}

            {/* Section header with number badge */}
            <div className="flex items-center space-x-3 mb-2 relative">
              <div className="z-10 inline-flex size-6 items-center justify-center rounded-full bg-muted font-mono text-[11px] tabular-nums text-foreground shadow-[inset_0_1px_2px_rgb(0_0_0/0.06)] ring-1 ring-inset ring-border/60">
                {String(section.id).padStart(2, '0')}
              </div>
              <Label className="text-sm font-semibold text-foreground">
                {section.label}
              </Label>
            </div>

            {/* Section items */}
            <div className="pl-9">
              <div className="flex flex-wrap gap-1.5 pb-6">
                {/* Special case for payment providers with tooltips */}
                {planSection && section.type === 'store' &&
                  planSection.existing.map((name) => (
                    <span key={name} className="inline-flex min-h-7 items-center gap-1.5 rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-foreground dark:bg-muted/60">
                      {name}
                      <span className="font-normal text-muted-foreground">Kept</span>
                    </span>
                  ))}
                {!planSection && section.type === 'paymentProviders' && selectedTemplate === 'full' ? (
                  <>
                    <SectionItem
                      item="Stripe"
                      sectionType={section.type}
                      status={
                        step === 'done'
                          ? 'completed'
                          : error && itemErrors[section.type]?.['Stripe']
                          ? 'error'
                          : completedItems[section.type]?.includes('Stripe')
                          ? 'completed'
                          : 'normal'
                      }
                      errorMessage={itemErrors[section.type]?.['Stripe']}
                      requiresEnvVar={{
                        vars: ['NEXT_PUBLIC_STRIPE_KEY', 'STRIPE_SECRET_KEY'],
                      }}
                      step={step}
                    />
                    <SectionItem
                      item="PayPal"
                      sectionType={section.type}
                      status={
                        step === 'done'
                          ? 'completed'
                          : error && itemErrors[section.type]?.['PayPal']
                          ? 'error'
                          : completedItems[section.type]?.includes('PayPal')
                          ? 'completed'
                          : 'normal'
                      }
                      errorMessage={itemErrors[section.type]?.['PayPal']}
                      requiresEnvVar={{
                        vars: [
                          'NEXT_PUBLIC_PAYPAL_CLIENT_ID',
                          'PAYPAL_CLIENT_SECRET',
                        ],
                      }}
                      step={step}
                    />
                    <SectionItem
                      item="Cash on Delivery"
                      sectionType={section.type}
                      status={
                        step === 'done'
                          ? 'completed'
                          : error && itemErrors[section.type]?.['Manual']
                          ? 'error'
                          : completedItems[section.type]?.includes('Manual')
                          ? 'completed'
                          : 'normal'
                      }
                      errorMessage={itemErrors[section.type]?.['Manual']}
                      step={step}
                    />
                  </>
                ) : (
                  // Standard items rendering for all other cases
                  items.map((item) => {
                    // Determine the status of this item
                    let status: 'normal' | 'loading' | 'completed' | 'error' = 'normal';
                    let errorMessage: string | undefined;

                    // For completed step, all items are completed
                    if (step === 'done') {
                      status = 'completed';
                    } else {
                      // Check for errors first
                      if (error && itemErrors[section.type]?.[item]) {
                        status = 'error';
                        errorMessage = itemErrors[section.type][item];
                      }
                      // Then check if it's completed
                      else if (completedItems[section.type]?.includes(item)) {
                        status = 'completed';
                      }
                      // Then check if it's loading
                      else if (
                        isLoading &&
                        loadingItems[section.type]?.includes(item)
                      ) {
                        status = 'loading';
                      }
                    }

                    return (
                      <SectionItem
                        key={item}
                        item={item}
                        sectionType={section.type}
                        status={status}
                        errorMessage={errorMessage}
                        requiresEnvVar={
                          planSection && section.type === 'paymentProviders' && PROVIDER_ENV_VARS[item]
                            ? { vars: PROVIDER_ENV_VARS[item] }
                            : undefined
                        }
                        step={step}
                      />
                    );
                  })
                )}
                {planLabel && (section.type !== 'store' || planSection?.existing.length === 0) && (
                  <span className="self-center text-xs text-muted-foreground">{planLabel}</span>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};