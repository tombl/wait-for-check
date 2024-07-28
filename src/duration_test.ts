import { parseDuration } from "./duration.ts";
import { assertEquals, assertThrows } from "@std/assert";

const VALID = [
  ["2d5h30ms", ((2 * 24 * 60) + (5 * 60)) * 60 * 1000 + 30],
  ["2d", 2 * 24 * 60 * 60 * 1000],
  ["1h", 60 * 60 * 1000],
  ["1H", 60 * 60 * 1000],
  ["5m", 5 * 60 * 1000],
  ["1m30s", 90 * 1000],
  ["3.5s", 3500],
  ["3s", 3000],
  ["500ms", 500],
] as const;

const INVALID = [
  "",
  "2x5y",
  "hello",
  "5",
  "30s1m",
  "1m5y",
];

Deno.test("parse valid", async (t) => {
  for (const [str, duration] of VALID) {
    await t.step(JSON.stringify(str), () => {
      assertEquals(parseDuration(str), duration);
    });
  }
});

Deno.test("parse invalid", async (t) => {
  for (const str of INVALID) {
    await t.step(JSON.stringify(str), () => {
      assertThrows(() => parseDuration(str));
    });
  }
});
