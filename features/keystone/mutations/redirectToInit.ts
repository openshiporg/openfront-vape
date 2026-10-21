import type { KeystoneContext } from "@keystone-6/core/types";
async function redirectToInit(root: unknown, _args: unknown, context: KeystoneContext<any>) {
  // 1. Query the current user see if they are signed in
  const userCount = await context.sudo().query.User.count({});

  if (userCount === 0) {
    return true;
  }
  return false;
}

export default redirectToInit;
