'use server';

import { runCommand } from '@/features/platform/lib/run-command';
import { sessionContext, type SaveResult } from '@/features/platform/lib/session-context';

const ADJUST = `
  mutation AdjustInventory($variantId: ID!, $delta: Int!, $reason: String!, $note: String) {
    adjustInventory(variantId: $variantId, delta: $delta, reason: $reason, note: $note) { id inventoryQuantity }
  }
`;

export type AdjustInput = {
  variantId: string;
  mode: 'delta' | 'set';
  quantity: number;
  reason: string;
  note: string;
};

async function currentQuantity(variantId: string) {
  const context = await sessionContext();
  const variant = await context.query.ProductVariant.findOne({ where: { id: variantId }, query: 'id inventoryQuantity' });
  return variant ? Number(variant.inventoryQuantity) || 0 : null;
}

export async function adjustStock(input: AdjustInput): Promise<SaveResult<{ id: string; inventoryQuantity: number }>> {
  if (!Number.isInteger(input.quantity)) return { success: false, error: 'Enter a whole number.' };
  if (!input.reason.trim()) return { success: false, error: 'Reason is required.' };

  let delta = input.quantity;
  if (input.mode === 'set') {
    if (input.quantity < 0) return { success: false, error: 'Stock cannot be negative.' };
    const current = await currentQuantity(input.variantId).catch(() => null);
    if (current === null) return { success: false, error: 'Variant not found.' };
    delta = input.quantity - current;
  }
  if (delta === 0) return { success: false, error: 'Stock is already at this quantity.' };

  return runCommand(
    ADJUST,
    { variantId: input.variantId, delta, reason: input.reason.trim(), note: input.note.trim() || null },
    data => data.adjustInventory
  );
}

export type BulkRow = { line: number; sku: string; delta: number; reason: string };
export type BulkOutcome = { line: number; sku: string; ok: boolean; message: string };

/** Applies pasted `sku,delta,reason` rows one at a time through adjustInventory. */
export async function adjustStockBulk(rows: BulkRow[]): Promise<SaveResult<BulkOutcome[]>> {
  if (rows.length === 0) return { success: false, error: 'No rows to apply.' };
  if (rows.length > 200) return { success: false, error: 'Apply at most 200 rows at a time.' };

  const context = await sessionContext();
  if (!context.session?.itemId) return { success: false, error: 'Sign in again to save.' };

  let variants: Array<{ id: string; sku: string }>;
  try {
    variants = (await context.query.ProductVariant.findMany({
      where: { sku: { in: [...new Set(rows.map(row => row.sku))] } },
      query: 'id sku',
    })) as any;
  } catch {
    return { success: false, error: "You don't have permission to view inventory." };
  }
  const bySku = new Map<string, string[]>();
  for (const variant of variants) bySku.set(variant.sku, [...(bySku.get(variant.sku) || []), variant.id]);

  const outcomes: BulkOutcome[] = [];
  for (const row of rows) {
    const ids = bySku.get(row.sku) || [];
    if (ids.length !== 1) {
      outcomes.push({ line: row.line, sku: row.sku, ok: false, message: ids.length ? 'SKU matches more than one variant' : 'SKU not found' });
      continue;
    }
    const result = await runCommand(ADJUST, { variantId: ids[0], delta: row.delta, reason: row.reason, note: 'Bulk adjustment' }, data => data.adjustInventory);
    outcomes.push(
      result.success
        ? { line: row.line, sku: row.sku, ok: true, message: `Now ${result.data.inventoryQuantity}` }
        : { line: row.line, sku: row.sku, ok: false, message: result.error }
    );
  }
  return { success: true, data: outcomes };
}
