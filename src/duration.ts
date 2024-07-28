const section = (unit: string) => `(?:(?<${unit}>[\\d.]+)${unit})?`;
const RE = new RegExp(
  "^" + section("d") + section("h") + section("m") + section("s") +
    section("ms") + "$",
  "i",
);

export function parseDuration(str: string): number {
  if (str === "") throw new Error(`Invalid duration: ${str}`);

  const match = str.match(RE);
  if (!match) throw new Error(`Invalid duration: ${str}`);

  const { d, h, m, s, ms } = match.groups!;
  let duration = 0;

  if (d) duration += Number.parseFloat(d);
  duration *= 24;
  if (h) duration += Number.parseFloat(h);
  duration *= 60;
  if (m) duration += Number.parseFloat(m);
  duration *= 60;
  if (s) duration += Number.parseFloat(s);
  duration *= 1000;
  if (ms) duration += Number.parseFloat(ms);

  return duration;
}
