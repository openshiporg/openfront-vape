'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectValue,
} from '@/components/ui/select';
import * as SelectPrimitive from '@radix-ui/react-select';
import { LOGO_ICONS, HUE_PRESETS } from '../lib/icon-registry';
import { updateStoreSettings } from '../actions';
import { StoreSettingsSaveBar } from '../components/StoreSettingsSaveBar';
import { toast } from 'sonner';
import { Code } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ListBand, SectionTitle, StatusWord } from '@/features/platform/components/vape-ui';
import {
  POLICY_PAGES,
  readStoreBusiness,
  readStorePolicies,
  type StoreBusiness,
  type StorePolicies,
} from '../lib/store-info';

interface StoreSettingsPageClientProps {
  initialData: {
    id: string;
    name: string;
    logoIcon: string;
    logoColor: string;
    homepageTitle: string;
    homepageDescription: string;
    metadata?: unknown;
  } | null;
  initialError: string | null;
}

export function StoreSettingsPageClient({
  initialData,
  initialError,
}: StoreSettingsPageClientProps) {
  const [name, setName] = useState(initialData?.name || '');
  const [logoIcon, setLogoIcon] = useState(
    initialData?.logoIcon || LOGO_ICONS[0].lightSvg
  );
  const [logoColor, setLogoColor] = useState(
    initialData?.logoColor || '0'
  );
  const [homepageTitle, setHomepageTitle] = useState(
    initialData?.homepageTitle || ''
  );
  const [homepageDescription, setHomepageDescription] = useState(
    initialData?.homepageDescription || ''
  );
  const [business, setBusiness] = useState<StoreBusiness>(() => readStoreBusiness(initialData?.metadata));
  const [licenses, setLicenses] = useState(() => readStoreBusiness(initialData?.metadata).licenses.join('\n'));
  const [policies, setPolicies] = useState<StorePolicies>(() => readStorePolicies(initialData?.metadata));
  const [isLoading, setIsLoading] = useState(false);

  const setBusinessField = (key: Exclude<keyof StoreBusiness, 'licenses'>, value: string) =>
    setBusiness((prev) => ({ ...prev, [key]: value }));

  const handleSave = async () => {
    if (!initialData?.id) {
      toast.error('No store found to update');
      return;
    }

    setIsLoading(true);
    const result = await updateStoreSettings(initialData.id, {
      name,
      logoIcon,
      logoColor,
      homepageTitle,
      homepageDescription,
      business: { ...business, licenses: licenses.split('\n') },
      policies,
    });

    if (result.success) {
      toast.success('Store settings updated successfully');
    } else {
      toast.error(result.error || 'Failed to update store settings');
    }
    setIsLoading(false);
  };

  if (initialError) {
    return (
      <div className="px-4 pb-10 md:px-6">
        <Alert variant="destructive">
          <AlertDescription>Error: {initialError}</AlertDescription>
        </Alert>
      </div>
    );
  }

  // Find matching preset icon, but don't default to first icon if not found
  const selectedIcon = LOGO_ICONS.find((icon) => icon.lightSvg === logoIcon);

  // Required before a regulated store can sell (mirrors missingStoreInfo), in form order.
  const blankRequired: Array<{ id: string; label: string; section: string }> = [
    ...(name.trim() ? [] : [{ id: 'store-name', label: 'Store name', section: 'Brand' }]),
    ...(business.legalName.trim() ? [] : [{ id: 'business-legalName', label: 'Legal name', section: 'Business' }]),
    ...(licenses.split('\n').some((line) => line.trim())
      ? []
      : [{ id: 'business-licenses', label: 'Licence numbers', section: 'Business' }]),
    ...POLICY_PAGES.filter((page) => !policies[page.key].trim()).map((page) => ({
      id: `policy-${page.key}`,
      label: page.title,
      section: 'Policies',
    })),
  ];
  const requiredIds = new Set(blankRequired.map((item) => item.id));
  const focusField = (id: string) => {
    const element = document.getElementById(id);
    if (!element) return;
    element.scrollIntoView({ block: 'center', behavior: 'smooth' });
    element.focus({ preventScroll: true });
  };

  const field = 'h-10 rounded-[4px] bg-background';
  const area = 'min-h-24 rounded-[4px] bg-background';
  const row = 'grid gap-2 px-4 py-4 sm:grid-cols-[9rem_minmax(0,1fr)] sm:items-center';
  const rowTop = 'grid gap-2 px-4 py-4 sm:grid-cols-[9rem_minmax(0,1fr)] sm:items-start';
  const requiredMark = (id: string) =>
    requiredIds.has(id) ? <span className="ml-1.5 text-xs font-medium text-[oklch(0.52_0.17_27)]">Required</span> : null;

  return (
    <div className="grid max-w-5xl gap-8 px-4 pb-24 md:px-6 md:pb-10 lg:grid-cols-[minmax(0,1fr)_20rem]">
      <div className="min-w-0 space-y-8">
        <section aria-label="Blank required fields">
          <SectionTitle meta={blankRequired.length}>Needs you</SectionTitle>
          <ListBand>
            {blankRequired.length === 0 ? (
              <div className="px-4 py-3">
                <StatusWord tone="ok">All required fields filled</StatusWord>
              </div>
            ) : (
              blankRequired.map((item) => (
                <div key={item.id} className="flex items-center justify-between gap-3 px-4 py-2">
                  <span className="flex min-w-0 flex-wrap items-baseline gap-x-2">
                    <StatusWord tone="warn">Blank</StatusWord>
                    <span className="text-sm font-medium text-foreground">{item.label}</span>
                    <span className="text-xs text-muted-foreground">{item.section}</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => focusField(item.id)}
                    className="inline-flex min-h-8 shrink-0 items-center rounded-[4px] border border-input bg-background px-3 text-sm font-medium text-foreground hover:bg-muted focus-visible:outline-2 focus-visible:outline-ring max-sm:min-h-10"
                  >
                    Fill
                  </button>
                </div>
              ))
            )}
          </ListBand>
        </section>

        <section>
          <SectionTitle>Brand</SectionTitle>
          <ListBand>
            <div className="grid gap-2 px-4 py-4 sm:grid-cols-[9rem_minmax(0,1fr)] sm:items-center">
              <Label htmlFor="store-name" className="text-sm text-muted-foreground">Store name{requiredMark('store-name')}</Label>
              <Input
                id="store-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={field}
              />
            </div>

            <div className="space-y-6 px-4 py-4">
              {/* Logo Icon Selector */}
              <div>
                <Label>Logo Icon</Label>
                <div className="mt-2 flex items-center gap-2">
                  <Select
                    value={selectedIcon?.id || ''}
                    onValueChange={(id) => {
                      const icon = LOGO_ICONS.find((i) => i.id === id);
                      if (icon) setLogoIcon(icon.lightSvg);
                    }}
                  >
                    <SelectPrimitive.Trigger
                      className={cn(
                        'flex h-12 w-12 shrink-0 rounded-lg border border-input bg-background focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 p-0 overflow-hidden items-center justify-center'
                      )}
                    >
                      <div
                        dangerouslySetInnerHTML={{ __html: logoIcon }}
                        style={{ filter: `hue-rotate(${logoColor}deg)` }}
                        className="[&>svg]:w-6 [&>svg]:h-6"
                      />
                    </SelectPrimitive.Trigger>
                    <SelectContent className="border-border dark:border-blue-700">
                      {LOGO_ICONS.map((icon) => (
                        <SelectItem key={icon.id} value={icon.id}>
                          <span className="flex items-center gap-3">
                            <div
                              dangerouslySetInnerHTML={{ __html: icon.lightSvg }}
                              style={{ filter: `hue-rotate(${logoColor}deg)` }}
                              className="[&>svg]:w-6 [&>svg]:h-6"
                            />
                            <span>
                              <span className="block font-medium text-gray-900 dark:text-gray-100">
                                {icon.name}
                              </span>
                            </span>
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* SVG Code Editor Popover */}
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-12 w-12 shrink-0"
                        type="button"
                      >
                        <Code className="h-4 w-4" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[min(500px,calc(100vw-2rem))]" align="start">
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-medium mb-2">Edit SVG Code</h4>
                          <p className="text-sm text-muted-foreground mb-4">
                            Edit the SVG code directly. Changes will be reflected in the icon preview.
                          </p>
                        </div>
                        <Textarea
                          value={logoIcon}
                          onChange={(e) => setLogoIcon(e.target.value)}
                          className="font-mono text-xs min-h-[300px]"
                          placeholder="<svg>...</svg>"
                        />
                        <div className="flex items-center gap-2">
                          <div className="text-sm text-muted-foreground">Preview:</div>
                          <div
                            dangerouslySetInnerHTML={{ __html: logoIcon }}
                            style={{ filter: `hue-rotate(${logoColor}deg)` }}
                            className="[&>svg]:w-8 [&>svg]:h-8 flex items-center justify-center p-2 border rounded"
                          />
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              {/* Logo Color Selector */}
              <div>
                <Label>Logo Color</Label>
                <div className="mt-2">
                  <Select
                    value={logoColor}
                    onValueChange={(value) => setLogoColor(value)}
                  >
                    <SelectPrimitive.Trigger
                      className={cn(
                        'flex h-12 w-12 shrink-0 rounded-lg border border-input bg-background focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 p-0 overflow-hidden items-center justify-center'
                      )}
                    >
                      <SelectValue>
                        <div
                          className="w-6 h-6 rounded-full"
                          style={{
                            background: `hsl(${(240 + parseInt(logoColor)) % 360}, 70%, 50%)`
                          }}
                        />
                      </SelectValue>
                    </SelectPrimitive.Trigger>
                    <SelectContent className="border-border dark:border-blue-700">
                      <div className="grid grid-cols-4 gap-2 p-2">
                        {HUE_PRESETS.map((preset) => (
                          <SelectItem
                            key={preset.value}
                            value={preset.value.toString()}
                            className="cursor-pointer p-0 h-12 w-12 flex items-center justify-center [&>span:first-child]:hidden"
                          >
                            <div
                              className="w-6 h-6 rounded-full"
                              style={{
                                background: `hsl(${(240 + preset.value) % 360}, 70%, 50%)`
                              }}
                            />
                          </SelectItem>
                        ))}
                      </div>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </ListBand>
        </section>

        <section>
          <SectionTitle>Homepage</SectionTitle>
          <ListBand>
            <div className="grid gap-2 px-4 py-4 sm:grid-cols-[9rem_minmax(0,1fr)] sm:items-center">
              <Label htmlFor="homepage-title" className="text-sm text-muted-foreground">Title</Label>
              <Input
                id="homepage-title"
                value={homepageTitle}
                onChange={(e) => setHomepageTitle(e.target.value)}
                className={field}
              />
            </div>
            <div className={rowTop}>
              <Label htmlFor="homepage-description" className="text-sm sm:pt-2.5 text-muted-foreground">Description</Label>
              <Textarea
                id="homepage-description"
                value={homepageDescription}
                onChange={(e) => setHomepageDescription(e.target.value)}
                rows={3}
                className={area}
              />
            </div>
          </ListBand>
        </section>

        <section>
          <SectionTitle>Business</SectionTitle>
          <ListBand>
            {(
              [
                { key: 'legalName', label: 'Legal name', type: 'text', autoComplete: 'organization' },
                { key: 'email', label: 'Contact email', type: 'email', autoComplete: 'email' },
                { key: 'phone', label: 'Contact phone', type: 'tel', autoComplete: 'tel' },
              ] as const
            ).map((item) => (
              <div key={item.key} className={row}>
                <Label htmlFor={`business-${item.key}`} className="text-sm text-muted-foreground">{item.label}{requiredMark(`business-${item.key}`)}</Label>
                <Input
                  id={`business-${item.key}`}
                  type={item.type}
                  autoComplete={item.autoComplete}
                  value={business[item.key]}
                  onChange={(e) => setBusinessField(item.key, e.target.value)}
                  className={field}
                />
              </div>
            ))}
            <div className={rowTop}>
              <Label htmlFor="business-address" className="text-sm sm:pt-2.5 text-muted-foreground">Address</Label>
              <Textarea
                id="business-address"
                value={business.address}
                onChange={(e) => setBusinessField('address', e.target.value)}
                rows={3}
                className={area}
              />
            </div>
            <div className={rowTop}>
              <Label htmlFor="business-licenses" className="text-sm sm:pt-2.5 text-muted-foreground">
                Licences{requiredMark('business-licenses')}
              </Label>
              <Textarea
                id="business-licenses"
                value={licenses}
                onChange={(e) => setLicenses(e.target.value)}
                rows={3}
                className={`${area} font-mono text-xs`}
              />
            </div>
          </ListBand>
        </section>

        <section>
          <SectionTitle>Policies</SectionTitle>
          <ListBand>
            {POLICY_PAGES.map((page) => (
              <div key={page.key} className={rowTop}>
                <Label htmlFor={`policy-${page.key}`} className="text-sm sm:pt-2.5 text-muted-foreground">
                  {page.title}{requiredMark(`policy-${page.key}`)}
                  <span className="block font-mono text-xs">/policies/{page.slug}</span>
                </Label>
                <Textarea
                  id={`policy-${page.key}`}
                  value={policies[page.key]}
                  onChange={(e) => setPolicies((prev) => ({ ...prev, [page.key]: e.target.value }))}
                  rows={6}
                  className={area}
                />
              </div>
            ))}
          </ListBand>
        </section>

        <StoreSettingsSaveBar
          isSaving={isLoading}
          button={
            <Button
              onClick={handleSave}
              disabled={isLoading}
              className="h-11 rounded-[4px] px-6 sm:h-10"
            >
              {isLoading ? 'Saving...' : 'Save settings'}
            </Button>
          }
        />
      </div>

      <aside className="min-w-0 lg:sticky lg:top-4 lg:self-start">
        <SectionTitle>Preview</SectionTitle>
        <ListBand>
          {/* Mirrors the storefront header lockup: LogoMark + store name */}
          <div className="flex min-h-16 items-center gap-2.5 bg-background px-4 py-4 dark:bg-zinc-900">
            <span
              aria-hidden="true"
              dangerouslySetInnerHTML={{ __html: logoIcon }}
              style={{ filter: `hue-rotate(${logoColor}deg)` }}
              className="block size-6 shrink-0 [&>svg]:block [&>svg]:h-full [&>svg]:w-full"
            />
            <span className="truncate text-[17px] font-semibold leading-none tracking-[-0.02em] text-foreground">
              {name || 'Store'}
            </span>
          </div>
          {(homepageTitle || homepageDescription) && (
            <div className="px-4 py-4">
              {homepageTitle && (
                <p className="text-lg font-semibold leading-tight text-foreground">{homepageTitle}</p>
              )}
              {homepageDescription && (
                <p className="mt-1.5 text-sm text-muted-foreground">{homepageDescription}</p>
              )}
            </div>
          )}
        </ListBand>
      </aside>
    </div>
  );
}
