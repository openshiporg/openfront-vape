// P0 account takeover: public user create defaults to MEMBER; a guest is only an explicit false. Offline.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
const root = path.resolve(__dirname, '..');

function load(file, mocks = {}) {
  const filename = path.join(root, file);
  const out = ts.transpileModule(fs.readFileSync(filename, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  const m = { exports: {} };
  vm.runInNewContext(out, { module: m, exports: m.exports, process: { env: {} }, Date, Number, String, Set, Object, Boolean,
    require: (s) => { if (!(s in mocks)) throw new Error(`Unmocked ${s}`); return mocks[s]; } }, { filename });
  return m.exports;
}
const { resolvePublicUserCreateData } = load('features/keystone/security/user-create.ts', { '../access': { permissions: { canManageUsers: () => false } } });
const { isRetirableGuest, retireReturningGuest, retiredGuestEmail } = load('features/keystone/security/guest-user.ts');
const resolve = (inputData) => resolvePublicUserCreateData({ inputData, resolvedData: { ...inputData } }).hasAccount;
const NEW = '2026-11-02T19:16:00.000Z';

test('a create that does not send hasAccount is a member, and is not retirable', () => {
  const data = resolvePublicUserCreateData({ inputData: { email: 'a@x.com', name: 'A', password: 'p' }, resolvedData: { email: 'a@x.com', name: 'A', password: 'p' } });
  assert.equal(data.hasAccount, true);
  assert.equal(isRetirableGuest({ id: 'u', ...data, createdAt: NEW, carts: [{ id: 'c' }] }), false);
});

test('the three vape sign-up inputs all resolve to member', () => {
  const src = (f) => fs.readFileSync(path.join(root, f), 'utf8');
  // dashboard signUp and createCustomer send hasAccount:true; the storefront signUp already did.
  assert.match(src('features/dashboard/actions/auth.ts'), /createUser\(data: \{ email: \$email, name: \$name, password: \$password, hasAccount: true \}\)/);
  assert.match(src('features/storefront/lib/data/user.ts'), /phone: data\.phone,\s*hasAccount: true,/);
  assert.match(src('features/storefront/lib/data/user.ts'), /phone: customer\.phone,\s*hasAccount: true,/);
  assert.equal(resolve({ email: 'a@x.com', name: 'A', password: 'p', hasAccount: true }), true);
  assert.equal(resolve({ email: 'a@x.com', name: 'A', password: 'p' }), true);
  assert.equal(resolve({ email: 'a@x.com', firstName: 'A', password: 'p', phone: '1' }), true);
});

test('only an explicit false (the guest checkout) makes a guest; guest checkout still sends it', () => {
  assert.equal(resolve({ email: 'g@x.com', hasAccount: false }), false);
  for (const odd of [null, undefined, 0, '', 'false', 'no']) assert.equal(resolve({ email: 'g@x.com', hasAccount: odd }), true, String(odd));
  assert.match(fs.readFileSync(path.join(root, 'features/storefront/lib/data/cart.ts'), 'utf8'), /email,\s*hasAccount: false,/);
});

test('an explicit false WITH a cart is retirable; the same guest without a cart is not', () => {
  assert.equal(isRetirableGuest({ id: 'g', hasAccount: false, createdAt: NEW, addresses: [{ id: 'a' }] }), true);
  assert.equal(isRetirableGuest({ id: 'g', hasAccount: false, createdAt: NEW }), false);
});

test('TAKEOVER: an anonymous create with a member email never retires the member', async () => {
  // Member signed up through the dashboard path (no hasAccount sent): stored as a member now.
  const memberData = resolvePublicUserCreateData({ inputData: { email: 'm@x.com', name: 'm', password: 'p' }, resolvedData: { email: 'm@x.com', name: 'm', password: 'p' } });
  const rows = [{ id: 'm1', email: 'm@x.com', hasAccount: memberData.hasAccount, createdAt: NEW, roleId: null, accounts: [], carts: [{ id: 'c' }], addresses: [], orders: [] }];
  const prisma = { user: {
    findFirst: async ({ where }) => rows.find((u) => u.email.toLowerCase() === where.email.equals.toLowerCase()) || null,
    update: async ({ where, data }) => Object.assign(rows.find((u) => u.id === where.id), data),
  } };
  assert.equal(await retireReturningGuest(prisma, 'M@x.com'), false);
  assert.equal(rows[0].email, 'm@x.com', 'member email is untouched, so the unique email check still refuses the second create');
  assert.notEqual(rows[0].email, retiredGuestEmail('m1'));
});

test('retireReturningGuest only runs for a public create, and the User hook wires it before the create', () => {
  const hook = fs.readFileSync(path.join(root, 'features/keystone/models/User.ts'), 'utf8');
  const guard = hook.indexOf("!permissions.canManageUsers({ session: context.session })");
  const retire = hook.indexOf('retireReturningGuest(context.prisma, resolvedData.email)');
  assert.ok(guard > 0 && retire > guard, 'retirement only for non-managers');
});

// ---- retire only AFTER validation (Keystone: beforeOperation runs after resolveInput + all field/list validation) ----
function loadUserHooks() {
  const guest = load('features/keystone/security/guest-user.ts');
  const create = load('features/keystone/security/user-create.ts', { '../access': { permissions: { canManageUsers: ({ session }) => session?.manager === true } } });
  const filename = path.join(root, 'features/keystone/models/User.ts');
  const out = ts.transpileModule(fs.readFileSync(filename, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  const m = { exports: {} };
  let captured;
  const field = () => ({});
  const mocks = {
    '@keystone-6/core': { list: (cfg) => { captured = cfg; return cfg; }, graphql: { field: () => ({}), String: {}, Boolean: {}, Int: {} }, group: (x) => x },
    '@keystone-6/core/access': { denyAll: () => false },
    '@keystone-6/core/fields': new Proxy({}, { get: () => field }),
    '../access': { isSignedIn: () => true, permissions: { canManageUsers: ({ session }) => session?.manager === true }, rules: new Proxy({}, { get: () => () => true }) },
    './trackingFields': { trackingFieldsFor: () => ({}) },
    '../security/guest-user': guest,
    '../security/user-create': create,
  };
  vm.runInNewContext(out, { module: m, exports: m.exports, process: { env: {} }, Date, Number, String, Set, Object, Boolean, Array, JSON, Promise, Error,
    require: (s) => { if (s in mocks) return mocks[s]; throw new Error(`Unmocked ${s}`); } }, { filename });
  return captured.hooks;
}

function guestDb(rows) {
  return { rows, user: {
    findFirst: async ({ where }) => rows.find((u) => u.email.toLowerCase() === where.email.equals.toLowerCase()) || null,
    update: async ({ where, data }) => Object.assign(rows.find((u) => u.id === where.id), data),
  } };
}
const GUEST_ROW = () => ({ id: 'g1', email: 'g@x.com', hasAccount: false, createdAt: NEW, roleId: null, accounts: [], carts: [{ id: 'c' }], addresses: [], orders: [] });

test('resolveInput never retires anyone any more (it runs before validation)', async () => {
  const hooks = loadUserHooks();
  const prisma = guestDb([GUEST_ROW()]);
  const data = await hooks.resolveInput({ operation: 'create', inputData: { email: 'g@x.com', password: 'x' }, resolvedData: { email: 'g@x.com', password: 'x' }, context: { session: null, prisma } });
  assert.equal(prisma.rows[0].email, 'g@x.com', 'resolveInput left the guest alone');
  assert.equal(data.hasAccount, true, 'and still applies the member default');
});

test('INVALID create (short password): Keystone fails validation before beforeOperation, so the guest email is NOT retired', async () => {
  const hooks = loadUserHooks();
  const prisma = guestDb([GUEST_ROW()]);
  const input = { email: 'g@x.com', name: 'x', password: 'short' };
  const resolved = await hooks.resolveInput({ operation: 'create', inputData: input, resolvedData: { ...input }, context: { session: null, prisma } });
  // Keystone's pipeline: resolveInput -> field + list validation -> beforeOperation -> DB write.
  const validation = (data) => (String(data.password).length >= 8 ? [] : ['Password must be at least 8 characters long']);
  const errors = validation(resolved);
  assert.ok(errors.length, 'validation rejects the short password');
  if (!errors.length) await hooks.beforeOperation({ operation: 'create', resolvedData: resolved, context: { session: null, prisma } });
  assert.equal(prisma.rows[0].email, 'g@x.com', 'guest email untouched after a failed create');
});

test('VALID guest create: beforeOperation retires the earlier guest record (only with a cart/order)', async () => {
  const hooks = loadUserHooks();
  const prisma = guestDb([GUEST_ROW()]);
  const input = { email: 'g@x.com', name: 'x', password: 'long-enough-password', hasAccount: false };
  const resolved = await hooks.resolveInput({ operation: 'create', inputData: input, resolvedData: { ...input }, context: { session: null, prisma } });
  await hooks.beforeOperation({ operation: 'create', resolvedData: resolved, context: { session: null, prisma } });
  assert.match(prisma.rows[0].email, /^retired-guest\+g1@guest\.invalid$/);
  const noCart = guestDb([{ ...GUEST_ROW(), carts: [] }]);
  await hooks.beforeOperation({ operation: 'create', resolvedData: resolved, context: { session: null, prisma: noCart } });
  assert.equal(noCart.rows[0].email, 'g@x.com', 'a guest-flagged row with no cart/order is still never retired');
});

test('beforeOperation retires only on a non-manager create, never a member, update or manager create', async () => {
  const hooks = loadUserHooks();
  const run = async (op, session, row) => {
    const prisma = guestDb([row]);
    await hooks.beforeOperation({ operation: op, resolvedData: { email: row.email }, context: { session, prisma } });
    return prisma.rows[0].email;
  };
  assert.equal(await run('create', null, { ...GUEST_ROW(), hasAccount: true }), 'g@x.com', 'a member is never retired');
  assert.equal(await run('update', null, GUEST_ROW()), 'g@x.com', 'not on update');
  assert.equal(await run('create', { manager: true }, GUEST_ROW()), 'g@x.com', 'not on a manager create');
  assert.match(await run('create', null, GUEST_ROW()), /@guest\.invalid$/);
});
