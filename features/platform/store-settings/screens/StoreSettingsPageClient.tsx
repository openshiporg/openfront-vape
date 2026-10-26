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
import { toast } from 'sonner';
import { Code } from 'lucide-react';
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
  const selectedHue = HUE_PRESETS.find((preset) => preset.value.toString() === logoColor);

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
  const square =
    'flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-[4px] border border-input bg-background p-0 transition-colors hover:bg-muted focus:outline-none focus-visible:outline-2 focus-visible:outline-ring disabled:cursor-not-allowed disabled:opacity-50';
  const requiredMark = (id: string) =>
    requiredIds.has(id) ? <span className="ml-1.5 text-[12px] font-medium text-[oklch(0.52_0.17_27)]">Required</span> : null;

  return (
    <div className="grid max-w-5xl gap-8 px-4 pb-10 md:px-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
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
                    <span className="text-[12px] text-muted-foreground">{item.section}</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => focusField(item.id)}
                    className="inline-flex min-h-8 shrink-0 items-center rounded-[4px] border border-input bg-background px-3 text-[13px] font-medium text-foreground hover:bg-muted focus-visible:outline-2 focus-visible:outline-ring max-sm:min-h-10"
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

            {/* Logo Icon Selector */}
            <div className="grid gap-2 px-4 py-4 sm:grid-cols-[9rem_minmax(0,1fr)] sm:items-center">
              <Label className="text-sm text-muted-foreground">Logo</Label>
              <div className="flex min-w-0 items-center gap-2">
                <Select
                  value={selectedIcon?.id || ''}
                  onValueChange={(id) => {
                    const icon = LOGO_ICONS.find((i) => i.id === id);
                    if (icon) setLogoIcon(icon.lightSvg);
                  }}
                >
                  <SelectPrimitive.Trigger aria-label="Logo icon" className={square}>
                    <div
                      dangerouslySetInnerHTML={{ __html: logoIcon }}
                      style={{ filter: `hue-rotate(${logoColor}deg)` }}
                      className="[&>svg]:h-6 [&>svg]:w-6"
                    />
                  </SelectPrimitive.Trigger>
                  <SelectContent className="max-h-80 border-border">
                    {LOGO_ICONS.map((icon) => (
                      <SelectItem key={icon.id} value={icon.id} className="min-h-10">
                        <span className="flex items-center gap-3">
                          <div
                            dangerouslySetInnerHTML={{ __html: icon.lightSvg }}
                            style={{ filter: `hue-rotate(${logoColor}deg)` }}
                            className="[&>svg]:h-6 [&>svg]:w-6"
                          />
                          <span className="block text-sm font-medium text-foreground">
                            {icon.name}
                          </span>
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <span className="min-w-0 truncate text-sm text-foreground">
                  {selectedIcon?.name || 'Custom SVG'}
                </span>

                {/* SVG Code Editor Popover */}
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="ghost"
                      type="button"
                      className="ml-auto h-10 shrink-0 rounded-[4px] border border-input bg-background px-3 text-[13px] font-medium hover:bg-muted [&_svg]:size-4"
                    >
                      <Code className="stroke-muted-foreground" />
                      <span className="hidden sm:inline">SVG</span>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[min(500px,calc(100vw-2rem))]" align="end">
                    <div className="space-y-3">
                      <h4 className="text-sm font-semibold">Edit SVG code</h4>
                      <Textarea
                        value={logoIcon}
                        onChange={(e) => setLogoIcon(e.target.value)}
                        className="min-h-[300px] font-mono text-xs"
                        placeholder="<svg>...</svg>"
                      />
                      <div className="flex items-center gap-2">
                        <div className="text-xs text-muted-foreground">Preview</div>
                        <div
                          dangerouslySetInnerHTML={{ __html: logoIcon }}
                          style={{ filter: `hue-rotate(${logoColor}deg)` }}
                          className="flex items-center justify-center rounded-[4px] bg-muted p-2 [&>svg]:h-8 [&>svg]:w-8"
                        />
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Logo Color Selector */}
            <div className="grid gap-2 px-4 py-4 sm:grid-cols-[9rem_minmax(0,1fr)] sm:items-center">
              <Label className="text-sm text-muted-foreground">Logo colour</Label>
              <div className="flex items-center gap-3">
                <Select
                  value={logoColor}
                  onValueChange={(value) => setLogoColor(value)}
                >
                  <SelectPrimitive.Trigger aria-label="Logo colour" className={square}>
                    <SelectValue>
                      <div
                        className="h-6 w-6 rounded-[2px]"
                        style={{
                          background: `hsl(${(240 + parseInt(logoColor)) % 360}, 70%, 50%)`
                        }}
                      />
                    </SelectValue>
                  </SelectPrimitive.Trigger>
                  <SelectContent className="border-border">
                    <div className="grid grid-cols-4 gap-2 p-2">
                      {HUE_PRESETS.map((preset) => (
                        <SelectItem
                          key={preset.value}
                          value={preset.value.toString()}
                          aria-label={preset.name}
                          className="flex h-12 w-12 cursor-pointer items-center justify-center rounded-[4px] p-0 [&>span:first-child]:hidden"
                        >
                          <div
                            className="h-6 w-6 rounded-[2px]"
                            style={{
                              background: `hsl(${(240 + preset.value) % 360}, 70%, 50%)`
                            }}
                          />
                        </SelectItem>
                      ))}
                    </div>
                  </SelectContent>
                </Select>
                <span className="text-sm text-foreground">{selectedHue?.name || 'Custom'}</span>
                <span className="font-mono text-xs tabular-nums text-muted-foreground">{logoColor}°</span>
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

        <Button
          onClick={handleSave}
          disabled={isLoading}
          className="h-11 w-full rounded-[4px] px-6 sm:h-10 sm:w-auto"
        >
          {isLoading ? 'Saving...' : 'Save settings'}
        </Button>
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
