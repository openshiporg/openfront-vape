'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { approveBuiltInProviders } from '../actions/builtin-setup';

/** One-click approval of the built-in methods for the profile's own scope. */
export function ApproveBuiltInButton({ profileId }: { profileId: string }) {
  const router = useRouter();
  const [error, setError] = useState('');
  const [pending, startTransition] = useTransition();
  return (
    <div className="flex flex-col items-start gap-1">
      <Button
        type="button"
        variant="outline"
        disabled={pending}
        className="h-9 rounded-[4px]"
        onClick={() => {
          setError('');
          startTransition(async () => {
            const result = await approveBuiltInProviders(profileId);
            if (!result.success) { setError(result.error); return; }
            toast.success(result.data.created.length ? `Approved ${result.data.created.length} provider${result.data.created.length === 1 ? '' : 's'}` : 'Everything was already approved');
            router.refresh();
          });
        }}
      >
        {pending ? 'Approving…' : 'Approve built-in providers'}
      </Button>
      <span className="text-[12px] text-muted-foreground">
        Age check, tax, carrier, registry, pay-at-pickup and installed card providers, for this profile's product types and launch jurisdictions.
      </span>
      {error && <span role="alert" className="text-[12px] text-destructive">{error}</span>}
    </div>
  );
}
