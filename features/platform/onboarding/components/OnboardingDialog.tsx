'use client';

import React from 'react';
import {
  AlertCircle,
  Loader2,
  ArrowUpRight,
  Eye,
  InfoIcon,
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Dot, ListBand, Pill, Track, pillClass, trackClass } from '@/features/platform/components/vape-ui';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CustomSetupSteps } from './CustomSetupSteps';
import { SectionRenderer } from './SectionRenderer';
import { useOnboardingState } from '../hooks/useOnboardingState';
import { useOnboardingApi } from '../hooks/useOnboardingApi';
import { STORE_TEMPLATES, SECTION_DEFINITIONS } from '../config/templates';

const TEMPLATE_CHOICES: Array<{
  value: 'minimal' | 'full' | 'custom';
  label: string;
  short: string;
  description: string;
}> = [
  { value: 'minimal', label: 'Basic Setup', short: 'Basic', description: 'One region, one payment method, minimal products' },
  { value: 'full', label: 'Complete Setup', short: 'Complete', description: 'Full catalog, shipping options, and collections' },
  { value: 'custom', label: 'Custom Setup', short: 'Custom', description: 'Copy JSON templates to create your own setup' },
];





// Payment provider environment variable mapping
const PAYMENT_PROVIDER_ENV_VARS: Record<string, string[]> = {
  Stripe: ['NEXT_PUBLIC_STRIPE_KEY', 'STRIPE_SECRET_KEY'],
  PayPal: ['NEXT_PUBLIC_PAYPAL_CLIENT_ID', 'PAYPAL_CLIENT_SECRET'],
};

// Component to display payment provider environment variables
interface PaymentProviderEnvDisplayProps {
  createdProviders: string[];
}

const PaymentProviderEnvDisplay: React.FC<PaymentProviderEnvDisplayProps> = ({
  createdProviders,
}) => {
  const [activeTab, setActiveTab] = React.useState(createdProviders[0] || '');

  // Filter out Cash on Delivery as it doesn't need env vars
  const providersWithEnvVars = createdProviders.filter(
    (provider) =>
      provider !== 'Cash on Delivery' && PAYMENT_PROVIDER_ENV_VARS[provider]
  );

  if (providersWithEnvVars.length === 0) {
    return null;
  }

  const renderEnvVars = (provider: string) => {
    const envVars = PAYMENT_PROVIDER_ENV_VARS[provider];
    if (!envVars) return null;

    return (
      <div className="space-y-2">
        <p className="text-xs text-muted-foreground mb-3">
          For {provider} to work, you need to add these environment variables to your .env file:
        </p>
        {envVars.map((envVar: string) => (
          <div key={envVar} className="flex items-center gap-2">
            <code className="rounded bg-muted px-2 py-1 font-mono text-xs">
              {envVar}
            </code>
          </div>
        ))}

      </div>
    );
  };

  if (providersWithEnvVars.length === 1) {
    // Single provider - show tooltip directly
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Eye className="ml-2 h-3 w-3 cursor-help text-red-500" />
          </TooltipTrigger>
          <TooltipContent
            side="bottom"
            align="start"
            className="p-3 text-xs max-w-sm z-[100]"
          >
            {renderEnvVars(providersWithEnvVars[0])}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  // Multiple providers - show tabs in tooltip
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <InfoIcon className="ml-2 h-3 w-3 cursor-help text-red-500" />
        </TooltipTrigger>
        <TooltipContent
          side="bottom"
          align="start"
          className="p-0 text-xs max-w-sm z-[100]"
        >
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full m-1"
          >
            <TabsList className={trackClass + " h-auto"}>
              {providersWithEnvVars.map((provider) => (
                <TabsTrigger
                  key={provider}
                  value={provider}
                  data-active={activeTab === provider}
                  className={pillClass + " flex-none border-0 data-[state=active]:shadow-[0_1px_2px_rgb(0_0_0/0.12),0_0_0_0.5px_rgb(0_0_0/0.06)]"}
                >
                  <code className="text-xs uppercase tracking-wide">
                    {provider}
                  </code>
                </TabsTrigger>
              ))}
            </TabsList>
            {providersWithEnvVars.map((provider) => (
              <TabsContent key={provider} value={provider} className="px-1 py-2 mt-0">
                {renderEnvVars(provider)}
              </TabsContent>
            ))}
          </Tabs>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

interface OnboardingDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const OnboardingDialog: React.FC<OnboardingDialogProps> = ({
  isOpen,
  onClose,
}) => {
  const onboardingState = useOnboardingState();
  const {
    step,
    selectedTemplate,
    currentJsonData,
    customJsonApplied,
    progressMessage,
    loadingItems,
    completedItems,
    error,
    itemErrors,
    isLoading,
    setStep,
    setSelectedTemplate,
    setCurrentJsonData,
    setCustomJsonApplied,
    setProgress,
    setItemLoading,
    setItemCompleted,
    setItemError,
    setError,
    setIsLoading,
    resetOnboardingState,
  } = onboardingState;

  const { runOnboarding } = useOnboardingApi({
    selectedTemplate,
    currentJsonData,
    completedItems,
    setProgress,
    setItemLoading,
    setItemCompleted,
    setItemError,
    setStep,
    setError,
    setIsLoading,
    resetOnboardingState,
  });



  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="flex max-h-[calc(100dvh-2rem)] max-w-[95vw] flex-col overflow-hidden p-0 gap-0 sm:max-w-4xl">
        <DialogHeader className="mb-0 shrink-0 border-b border-border px-4 py-4 sm:px-6">
          <DialogTitle>Onboarding</DialogTitle>
        </DialogHeader>

        <div className="flex min-h-0 flex-1 flex-col overflow-hidden lg:flex-row">
          {/* Mobile-first layout: Store Setup header and Setup Type appear first */}
          <div className="order-1 flex shrink-0 flex-col lg:order-none lg:w-80 lg:justify-between lg:border-r">
            <div className="h-11 flex-1 rounded-full">
              <div className="p-4 sm:p-6">
                {/* Store Setup Header - Always visible first on mobile */}
                <div>
                  <div className="space-y-0.5">
                    <h3 className="flex items-baseline gap-2 text-sm font-semibold text-foreground">
                      <Dot tone={step === 'done' ? 'ok' : isLoading ? 'info' : error ? 'danger' : 'muted'} />
                      Store Setup
                    </h3>
                    <p className="pl-4 text-sm text-muted-foreground">
                      {step === 'done'
                        ? 'Your store is ready'
                        : selectedTemplate === 'custom'
                        ? 'Copy JSON templates for custom setup'
                        : 'Configure your new store'}
                    </p>
                  </div>
                </div>
                <Separator className="my-4 lg:my-5" />

                {step === 'done' ? (
                  <>
                    <h4 className="mb-2 text-sm font-semibold text-foreground">
                      Setup Complete
                    </h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      Your{' '}
                      {selectedTemplate === 'minimal' ? 'Basic' : 'Complete'}
                      {' '}store setup is ready to use.
                    </p>
                    <div className="mb-4 flex items-baseline gap-2 text-sm font-medium text-foreground">
                      <Dot tone="ok" />
                      <span>Onboarding complete</span>
                    </div>

                    <ListBand className="text-sm">
                      {[
                        { key: 'regions', singular: 'region', plural: 'regions' },
                        { key: 'paymentProviders', singular: 'payment method', plural: 'payment methods' },
                        { key: 'shipping', singular: 'shipping option', plural: 'shipping options' },
                        { key: 'categories', singular: 'category', plural: 'categories' },
                        { key: 'products', singular: 'product', plural: 'products' },
                      ].map(({ key, singular, plural }) => {
                        const count = STORE_TEMPLATES[selectedTemplate].displayNames[key as 'regions' | 'paymentProviders' | 'shipping' | 'categories' | 'products'].length;
                        return (
                          <div key={key} className="flex items-center gap-2 px-3 py-2 text-muted-foreground">
                            <span className="min-w-6 font-mono tabular-nums text-foreground">{count}</span>
                            <span>
                              {count === 1 ? singular : plural} created
                            </span>
                            {key === 'paymentProviders' && (
                              <PaymentProviderEnvDisplay
                                createdProviders={
                                  STORE_TEMPLATES[selectedTemplate].displayNames
                                    .paymentProviders
                                }
                              />
                            )}
                          </div>
                        );
                      })}
                    </ListBand>
                  </>
                ) : !isLoading ? (
                  <>
                    <h4 className="mb-3 text-sm font-semibold text-foreground">
                      Setup Type
                    </h4>
                    
                    {/* Mobile: segmented selector */}
                    <div className="lg:hidden">
                      <Track label="Setup type" className="w-full">
                        {TEMPLATE_CHOICES.map((choice) => (
                          <Pill
                            key={choice.value}
                            active={selectedTemplate === choice.value}
                            onClick={() => setSelectedTemplate(choice.value)}
                            className="h-11 flex-1 rounded-full"
                          >
                            {choice.short}
                          </Pill>
                        ))}
                      </Track>
                      <p className="mt-2 text-xs text-muted-foreground">
                        {TEMPLATE_CHOICES.find((choice) => choice.value === selectedTemplate)?.description}
                      </p>
                    </div>

                    {/* Desktop: Radio Group */}
                    <div className="hidden lg:block">
                      <RadioGroup
                        value={selectedTemplate}
                        onValueChange={(value) =>
                          setSelectedTemplate(value as 'minimal' | 'full' | 'custom')
                        }
                        className="gap-0"
                      >
                        <ListBand>
                          {TEMPLATE_CHOICES.map((choice) => {
                            const active = selectedTemplate === choice.value;
                            return (
                              <div
                                key={choice.value}
                                className={`cursor-pointer px-4 py-3 transition-colors ${
                                  active ? 'bg-background dark:bg-zinc-800' : 'hover:bg-background/60'
                                }`}
                                onClick={() => setSelectedTemplate(choice.value)}
                              >
                                <RadioGroupItem
                                  value={choice.value}
                                  id={choice.value}
                                  className="sr-only"
                                />
                                <Label
                                  htmlFor={choice.value}
                                  className="block cursor-pointer"
                                >
                                  <span className="flex items-baseline gap-2 text-sm font-medium text-foreground">
                                    <Dot tone={active ? 'accent' : 'muted'} className={active ? '' : 'opacity-40'} />
                                    {choice.label}
                                  </span>
                                  <span className="mt-0.5 block pl-4 text-xs font-normal text-muted-foreground">
                                    {choice.description}
                                  </span>
                                </Label>
                              </div>
                            );
                          })}
                        </ListBand>
                      </RadioGroup>
                    </div>
                  </>
                ) : (
                  <>
                    <h4 className="flex items-baseline gap-2 text-sm font-semibold text-foreground">
                      <Dot tone="info" className="animate-pulse" />
                      Creating {selectedTemplate === 'minimal' ? 'Basic' : 'Complete'} Setup
                    </h4>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">
                      {progressMessage}
                    </p>
                  </>
                )}
              </div>
            </div>
            {/* Desktop buttons - hidden on mobile */}
            <div className="hidden lg:flex flex-col border-t mt-auto">
              {/* Error message above buttons */}
              {error && !isLoading && step !== 'done' && (
                <div role="alert" className="flex items-start gap-2.5 border-b border-border bg-red-50 px-4 py-3 text-red-700 dark:bg-red-950/30 dark:text-red-300">
                  <AlertCircle className="mt-0.5 size-4 shrink-0" />
                  <span className="text-xs sm:text-sm">
                    Error: Please ensure you're using a fresh installation
                    without existing data.
                  </span>
                </div>
              )}

              {/* Desktop Buttons */}
              <div className="flex items-center justify-between p-4">
                {step === 'done' ? (
                  <div className="flex flex-col sm:flex-row gap-2 w-full">
                    <DialogClose asChild>
                      <Button type="button" variant="outline" className="h-10 w-full rounded-full px-5 sm:w-auto">
                        Close
                      </Button>
                    </DialogClose>
                    <Button asChild className="h-10 w-full rounded-full px-5 sm:w-auto">
                      <a href="/" target="_blank" rel="noopener noreferrer">
                        View your storefront
                        <ArrowUpRight className="ml-1.5 h-4 w-4" />
                      </a>
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row gap-2 w-full">
                    <DialogClose asChild>
                      <Button
                        type="button"
                        variant="ghost"
                        disabled={isLoading}
                        className="h-10 w-full rounded-full px-5 sm:w-auto"
                      >
                        Cancel
                      </Button>
                    </DialogClose>
                    {isLoading ? (
                      <Button disabled className="h-10 w-full rounded-full px-5 sm:w-auto">
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating...
                      </Button>
                    ) : (
                      <Button onClick={runOnboarding} className="h-10 w-full rounded-full px-5 sm:w-auto">
                        Confirm
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="order-2 min-h-0 flex-1 overflow-y-auto p-4 sm:p-6 lg:order-none">
            {selectedTemplate === 'custom' && step === 'template' && !customJsonApplied ? (
              /* Custom Setup Steps */
              <CustomSetupSteps
                currentJson={currentJsonData}
                onJsonUpdate={(newJsonData) => {
                  setCurrentJsonData(newJsonData);
                  setCustomJsonApplied(true);
                }}
                onBack={() => setCustomJsonApplied(false)}
              />
            ) : (
              /* Unified Section Renderer Component */
              <SectionRenderer
                sections={SECTION_DEFINITIONS}
                selectedTemplate={selectedTemplate}
                isLoading={isLoading}
                loadingItems={loadingItems}
                completedItems={completedItems}
                itemErrors={itemErrors}
                error={error}
                step={step}
                currentJsonData={currentJsonData}
              />
            )}
          </div>
        </div>

        {/* Mobile buttons - attached to bottom */}
        <div className="flex shrink-0 flex-col border-t lg:hidden">
          {/* Mobile Error message above buttons */}
          {error && !isLoading && step !== 'done' && (
            <div role="alert" className="flex items-start gap-2.5 border-b border-border bg-red-50 px-4 py-3 text-red-700 dark:bg-red-950/30 dark:text-red-300">
              <AlertCircle className="mt-0.5 size-4 shrink-0" />
              <span className="text-xs sm:text-sm">
                Error: Please ensure you're using a fresh installation
                without existing data.
              </span>
            </div>
          )}

          {/* Mobile Buttons */}
          <div className="flex items-center justify-between p-4">
            {step === 'done' ? (
              <div className="flex flex-col sm:flex-row gap-2 w-full">
                <DialogClose asChild>
                  <Button type="button" variant="outline" className="h-11 flex-1 rounded-full">
                    Close
                  </Button>
                </DialogClose>
                <Button asChild className="h-11 flex-1 rounded-full">
                  <a href="/" target="_blank" rel="noopener noreferrer">
                    View your storefront
                    <ArrowUpRight className="ml-1.5 h-4 w-4" />
                  </a>
                </Button>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row gap-2 w-full">
                <DialogClose asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    disabled={isLoading}
                    className="h-11 flex-1 rounded-full"
                  >
                    Cancel
                  </Button>
                </DialogClose>
                {isLoading ? (
                  <Button disabled className="h-11 flex-1 rounded-full">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </Button>
                ) : (
                  <Button onClick={runOnboarding} className="h-11 flex-1 rounded-full">
                    Confirm
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OnboardingDialog;
