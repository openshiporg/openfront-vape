'use client'

import { TransitionActions, type TransitionAction } from '@/features/platform/product-evidence/components/TransitionActions'
import { transitionProviderApproval, type ApprovalDetail } from '../actions/provider-approvals'
import { EDITABLE_APPROVAL_STATUSES } from './approval-display'
import { EditApprovalSheet } from './EditApprovalSheet'

export function ApprovalActions({ approval }: { approval: ApprovalDetail }) {
  const run = (action: string) => () => transitionProviderApproval(approval.id, action)
  const actions: TransitionAction[] = []
  if (approval.status === 'unconfigured') {
    actions.push({ key: 'review', label: 'Submit for review', done: 'Submitted for review', primary: true, run: run('review') })
  }
  if (['unconfigured', 'review'].includes(approval.status)) {
    actions.push({ key: 'activate', label: 'Activate', done: 'Approval active', primary: approval.status === 'review', run: run('activate') })
  }
  if (approval.status === 'active') {
    actions.push({ key: 'suspend', label: 'Suspend', done: 'Approval suspended', danger: true, run: run('suspend') })
  }
  if (['active', 'suspended', 'review', 'unconfigured'].includes(approval.status)) {
    actions.push({ key: 'revoke', label: 'Revoke', done: 'Approval revoked', danger: true, run: run('revoke') })
  }
  if (['active', 'suspended'].includes(approval.status)) {
    actions.push({ key: 'expire', label: 'Mark expired', done: 'Approval expired', danger: true, run: run('expire') })
  }

  return (
    <TransitionActions actions={actions}>
      {EDITABLE_APPROVAL_STATUSES.includes(approval.status) && <EditApprovalSheet approval={approval} />}
    </TransitionActions>
  )
}
