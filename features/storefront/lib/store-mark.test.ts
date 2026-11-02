import { test } from "node:test";
import assert from "node:assert/strict";
import { DEFAULT_STORE_LOGO_ICON } from "../../platform/store-settings/lib/store-logo";
import { storeOwnMark } from "./store-mark";
import { storeBrand, VAPE_LOGO_ICON } from "./vape-brand";

test("no saved mark means wordmark only", () => {
  assert.equal(storeOwnMark(null), "");
  assert.equal(storeOwnMark(undefined), "");
  assert.equal(storeOwnMark("   "), "");
});

test("the platform placeholder saved by onboarding is not the store's mark", () => {
  assert.equal(storeOwnMark(DEFAULT_STORE_LOGO_ICON), "");
  assert.equal(storeOwnMark(`  ${DEFAULT_STORE_LOGO_ICON}\n`), "");
});

test("a mark set in Store Settings still shows", () => {
  const cloud = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="#155eef" d="M6 18h11a4 4 0 0 0 0-8z"/></svg>';
  const out = storeOwnMark(cloud);
  assert.match(out, /^<svg/);
  assert.match(out, /M6 18h11/);
});

test("the storefront never draws a hard-coded mark when Store Settings has none", () => {
  assert.equal(storeBrand(null).logoSvg, "");
  assert.equal(storeBrand({ logoIcon: "" }).logoSvg, "");
  assert.equal(storeBrand({ logoIcon: DEFAULT_STORE_LOGO_ICON }).logoSvg, "");
  assert.match(storeBrand({ logoIcon: VAPE_LOGO_ICON, logoColor: "317" }).logoSvg, /^<svg/);
});
