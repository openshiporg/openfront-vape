import { test } from "node:test";
import assert from "node:assert/strict";
import { normaliseSearch, searchWhere, SEARCH_MAX_LENGTH } from "./search-query";

test("normalises whitespace, arrays and length", () => {
  assert.equal(normaliseSearch("  pod   kit "), "pod kit");
  assert.equal(normaliseSearch(["coil", "x"]), "coil");
  assert.equal(normaliseSearch(undefined), "");
  assert.equal(normaliseSearch("x".repeat(200)).length, SEARCH_MAX_LENGTH);
});

test("only published, priced, non-gift-card products", () => {
  const where = searchWhere("nova", "us") as any;
  assert.deepEqual(where.AND[0], { status: { in: ["published"] } });
  assert.deepEqual((searchWhere("nova", "us", ["published", "draft"]) as any).AND[0], { status: { in: ["published", "draft"] } });
  assert.deepEqual(where.AND[1], { isGiftcard: { equals: false } });
  assert.match(JSON.stringify(where.AND[2]), /"iso2":\{"equals":"us"\}/);
});

test("each word must match title, subtitle, handle, category or tag", () => {
  const where = searchWhere("cool menthol", "us") as any;
  assert.equal(where.AND.length, 5);
  assert.equal(where.AND[3].OR[0].title.contains, "cool");
  assert.equal(where.AND[4].OR[3].productCategories.some.title.contains, "menthol");
});
