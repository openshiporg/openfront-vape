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
