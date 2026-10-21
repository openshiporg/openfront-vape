// The registered no-argument legacy endpoint cannot identify or validate a file.
// Do not report a queued batch job as an executed inventory import.
export default async function importInventory(_root: unknown, _args: unknown, _context: unknown): Promise<never> {
  throw new Error('Select and validate a file through the inventory import workflow');
}
