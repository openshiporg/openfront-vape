'use client'

import React, { useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { DataTable, ListBand, SectionTitle, Stamp, StatusWord, Td, Th, Tr, buttonClass } from '../../components/vape-ui'
import { cn } from '@/lib/utils'
import { Loader2, Plus } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { updateOAuthAppRedirectUris } from '../actions'
import { toast } from 'sonner'

interface ExistingApp {
  id: string
  name: string
  description?: string
  clientId: string
  redirectUris: string[]
  scopes: string[]
  status: 'active' | 'suspended'
}

interface AppsPageClientProps {
  existingApps: ExistingApp[]
}

function ExistingAppCard({
  app,
  onRedirectUrisUpdate,
}: {
  app: ExistingApp
  onRedirectUrisUpdate: (appId: string, redirectUris: string[]) => void
}) {
  const [showAddUrlDialog, setShowAddUrlDialog] = useState(false)
  const [newRedirectUrl, setNewRedirectUrl] = useState('')
  const [isUpdating, setIsUpdating] = useState(false)

  const handleAddRedirectUrl = async () => {
    const redirectUrl = newRedirectUrl.trim()
    if (!redirectUrl) return

    setIsUpdating(true)
    try {
      const updatedUris = [...(app.redirectUris || []), redirectUrl]
      const result = await updateOAuthAppRedirectUris(app.id, updatedUris)
      if (!result.success) {
        toast.error(result.error || 'Failed to add redirect URL')
        return
      }
      onRedirectUrisUpdate(app.id, updatedUris)
      setNewRedirectUrl('')
      setShowAddUrlDialog(false)
      toast.success('Redirect URL added successfully')
    } catch {
      toast.error('Failed to add redirect URL')
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <>
      <Tr>
        <Td className="max-w-[18rem]">
          <span className="block truncate font-medium text-foreground">{app.name}</span>
          {app.description && (
            <span className="block truncate text-[12px] text-muted-foreground">{app.description}</span>
          )}
          <span className="block break-all font-mono text-[11px] text-muted-foreground md:hidden">{app.clientId}</span>
        </Td>
        <Td>
          <Stamp tone={app.status === 'active' ? 'ok' : 'danger'}>
            {app.status === 'active' ? 'Active' : 'Suspended'}
          </Stamp>
        </Td>
        <Td priority={2} className="font-mono text-[12px] text-foreground">
          <span className="break-all">{app.clientId}</span>
        </Td>
        <Td priority={3} className="max-w-[22rem]">
          {(app.redirectUris || []).length === 0 ? (
            <StatusWord tone="warn">None</StatusWord>
          ) : (
            <ul className="space-y-0.5">
              {(app.redirectUris || []).map((uri) => (
                <li key={uri} className="break-all font-mono text-[12px] text-foreground">{uri}</li>
              ))}
            </ul>
          )}
        </Td>
        <Td align="right">
          <button
            type="button"
            className={cn(buttonClass.base, buttonClass.outline)}
            onClick={() => setShowAddUrlDialog(true)}
            aria-label={`Add redirect URL to ${app.name}`}
          >
            <Plus />
            <span className="max-sm:hidden">Add redirect URL</span>
          </button>
        </Td>
      </Tr>

      <Dialog open={showAddUrlDialog} onOpenChange={setShowAddUrlDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add redirect URL</DialogTitle>
            <DialogDescription>{app.name}</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor={`redirect-url-${app.id}`}>Redirect URL</Label>
            <Input
              id={`redirect-url-${app.id}`}
              value={newRedirectUrl}
              onChange={(event) => setNewRedirectUrl(event.target.value)}
              placeholder="https://example.com/api/oauth/callback"
              disabled={isUpdating}
              className="mt-2"
            />
          </div>
          <DialogFooter>
            <Button
              variant="ghost"
              className="h-10 rounded-[4px] px-4"
              onClick={() => {
                setShowAddUrlDialog(false)
                setNewRedirectUrl('')
              }}
              disabled={isUpdating}
            >
              Cancel
            </Button>
            <Button className="h-10 rounded-[4px] px-4" onClick={handleAddRedirectUrl} disabled={isUpdating || !newRedirectUrl.trim()}>
              {isUpdating && <Loader2 className="mr-2 size-4 animate-spin" />}
              Add URL
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

export function AppsPageClient({ existingApps = [] }: AppsPageClientProps) {
  const [apps, setApps] = useState(existingApps)
  const handleRedirectUrisUpdate = useCallback((appId: string, redirectUris: string[]) => {
    setApps((current) => current.map((app) => app.id === appId ? { ...app, redirectUris } : app))
  }, [])

  const needsYou = apps
    .map((app) => ({
      app,
      issue:
        app.status !== 'active'
          ? { tone: 'danger' as const, word: 'Suspended', detail: 'Installs and token refresh are blocked' }
          : (app.redirectUris || []).length === 0
            ? { tone: 'warn' as const, word: 'No redirect URL', detail: 'OAuth sign-in cannot complete' }
            : null,
    }))
    .filter((entry) => entry.issue)
    .sort((a, b) => (a.issue!.tone === 'danger' ? 0 : 1) - (b.issue!.tone === 'danger' ? 0 : 1))

  return (
    <div className="space-y-8 px-4 pb-6 md:px-6">
      {needsYou.length > 0 && (
        <section aria-label="Apps that need you">
          <SectionTitle meta={needsYou.length}>Needs you</SectionTitle>
          <ListBand>
            {needsYou.map(({ app, issue }) => (
              <div key={app.id} className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 px-4 py-2.5">
                <span className="flex min-w-0 flex-wrap items-baseline gap-x-2.5">
                  <StatusWord tone={issue!.tone}>{issue!.word}</StatusWord>
                  <span className="text-sm font-medium text-foreground">{app.name}</span>
                  <span className="text-[12px] text-muted-foreground">{issue!.detail}</span>
                </span>
                <span className="font-mono text-[11px] text-muted-foreground">{app.clientId}</span>
              </div>
            ))}
          </ListBand>
        </section>
      )}

      <section aria-label="OAuth applications">
        <SectionTitle meta={apps.length}>OAuth applications</SectionTitle>
        {apps.length === 0 ? (
          <ListBand>
            <div className="px-4 py-3 text-sm text-muted-foreground">No OAuth applications</div>
          </ListBand>
        ) : (
          <DataTable aria-label="OAuth applications">
            <thead>
              <tr>
                <Th>App</Th>
                <Th>Status</Th>
                <Th priority={2}>Client ID</Th>
                <Th priority={3}>Redirect URLs</Th>
                <Th align="right"><span className="sr-only">Actions</span></Th>
              </tr>
            </thead>
            <tbody>
              {apps.map((app) => (
                <ExistingAppCard
                  key={app.id}
                  app={app}
                  onRedirectUrisUpdate={handleRedirectUrisUpdate}
                />
              ))}
            </tbody>
          </DataTable>
        )}
      </section>
    </div>
  )
}
