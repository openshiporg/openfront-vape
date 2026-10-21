// bcryptjs 2.4.3 (transitive via @keystone-6/core) ships no types. This declares only
// the CommonJS export's callback-less compare(s, hash), which resolves to a boolean.
declare module 'bcryptjs' {
  const bcryptjs: {
    compare(s: string, hash: string): Promise<boolean>;
  };
  export = bcryptjs;
}
