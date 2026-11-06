// Minimal permissions stub for unit tests that load Keystone mutations directly.
const role = (session) => session?.data?.role || {};
exports.permissions = new Proxy({}, { get: (_t, key) => ({ session }) => Boolean(role(session)[key]) });
