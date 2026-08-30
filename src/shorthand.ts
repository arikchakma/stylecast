import { camelCase } from './camel-case';
import { kebabCase } from './kebab-case';

const WHITESPACE_REGEX = /\s/;
const NUMERIC_REGEX = /^[+\-.\d]/;
const CALC_REGEX = /^calc\(/i;
const IMPORTANT_REGEX = /!\s*important\s*$/i;

const BOX_PREFIXES = ['margin', 'padding'] as const;
const BOX_SIDES = ['top', 'right', 'bottom', 'left'] as const;
const BORDER_PARTS = ['width', 'style', 'color'] as const;
const RADIUS_CORNERS = [
  'top-left',
  'top-right',
  'bottom-right',
  'bottom-left',
] as const;

// https://www.w3.org/TR/css-backgrounds-3/#typedef-line-style
const BORDER_STYLE_KEYWORDS = new Set([
  'none',
  'hidden',
  'dotted',
  'dashed',
  'solid',
  'double',
  'groove',
  'ridge',
  'inset',
  'outset',
]);

// https://www.w3.org/TR/css-backgrounds-3/#typedef-line-width
const BORDER_WIDTH_KEYWORDS = new Set(['thin', 'medium', 'thick']);

// a wide keyword stands for the whole value, so every part takes it
// https://www.w3.org/TR/css-cascade-5/#defaulting-keywords
const WIDE_KEYWORDS = new Set([
  'inherit',
  'initial',
  'unset',
  'revert',
  'revert-layer',
]);

// a shorthand resets every part it leaves out to that part's initial value
// https://www.w3.org/TR/css-cascade-5/#shorthand
const BORDER_INITIAL_VALUES = {
  color: 'currentcolor',
  style: 'none',
  width: 'medium',
} as const;

type Quad = [string, string, string, string];
type Entry = [string, string];

function components(value: string) {
  const parts: string[] = [];
  let depth = 0;
  let start = -1;

  for (let index = 0; index < value.length; index++) {
    const char = value[index]!;

    if (char === '(') {
      depth++;
    } else if (char === ')') {
      depth--;
    }

    if (depth === 0 && WHITESPACE_REGEX.test(char)) {
      if (start !== -1) {
        parts.push(value.slice(start, index));
        start = -1;
      }
      continue;
    }

    if (start === -1) {
      start = index;
    }
  }

  if (start !== -1) {
    parts.push(value.slice(start));
  }

  return parts;
}

// one value covers every edge, two the first pair then the second, three leave
// the fourth edge mirroring the second
// https://www.w3.org/TR/css-values-4/#comb-comma
function edges(parts: string[]): Quad | null {
  const [first, second, third, fourth] = parts;
  if (first === undefined) {
    return null;
  }

  return [first, second ?? first, third ?? first, fourth ?? second ?? first];
}

function shortest(values: string[]) {
  const [first, second, third, fourth] = values;
  if (
    first === undefined ||
    second === undefined ||
    third === undefined ||
    fourth === undefined
  ) {
    return null;
  }

  if (first === second && second === third && third === fourth) {
    return first;
  }
  if (first === third && second === fourth) {
    return `${first} ${second}`;
  }
  if (second === fourth) {
    return `${first} ${second} ${third}`;
  }

  return `${first} ${second} ${third} ${fourth}`;
}

function quad(
  keys: readonly [string, string, string, string],
  build: (key: string) => string
): Quad {
  const [first, second, third, fourth] = keys;
  return [build(first), build(second), build(third), build(fourth)];
}

function sides(build: (side: string) => string) {
  return quad(BOX_SIDES, build);
}

// every shorthand whose value is a quad, mapped to the longhands it fills
const QUAD_SHORTHANDS = new Map<string, Quad>([
  ...BOX_PREFIXES.map(
    (prefix) => [prefix, sides((side) => `${prefix}-${side}`)] as const
  ),
  ...BORDER_PARTS.map(
    (part) =>
      [`border-${part}`, sides((side) => `border-${side}-${part}`)] as const
  ),
  [
    'border-radius',
    quad(RADIUS_CORNERS, (corner) => `border-${corner}-radius`),
  ] as const,
]);

// `border-<side>` sets the same three parts `border` does, on one side only
const BORDER_SIDE_SHORTHANDS = new Map<string, Record<string, string>>(
  BOX_SIDES.map((side) => [
    `border-${side}`,
    Object.fromEntries(
      BORDER_PARTS.map((part) => [part, `border-${side}-${part}`])
    ),
  ])
);

const BORDER_PART_SHORTHANDS = BORDER_PARTS.map((part) => `border-${part}`);

const CAMEL_CASE_NAMES = new Map<string, string>();
for (const [shorthand, keys] of QUAD_SHORTHANDS) {
  for (const name of [shorthand, ...keys]) {
    CAMEL_CASE_NAMES.set(name, camelCase(name));
  }
}
for (const keys of BORDER_SIDE_SHORTHANDS.values()) {
  for (const name of Object.values(keys)) {
    CAMEL_CASE_NAMES.set(name, camelCase(name));
  }
}
CAMEL_CASE_NAMES.set('border', camelCase('border'));

function camel(property: string) {
  return CAMEL_CASE_NAMES.get(property) ?? camelCase(property);
}

function zip(keys: Quad, values: Quad) {
  const [firstKey, secondKey, thirdKey, fourthKey] = keys;
  const [first, second, third, fourth] = values;

  return {
    [firstKey]: first,
    [secondKey]: second,
    [thirdKey]: third,
    [fourthKey]: fourth,
  };
}

function priority(value: string) {
  if (!value.includes('!')) {
    return { bare: value.trim(), important: '' };
  }

  return {
    bare: value.replace(IMPORTANT_REGEX, '').trim(),
    important: IMPORTANT_REGEX.test(value) ? '!important' : '',
  };
}

function border(value: string) {
  if (WIDE_KEYWORDS.has(value.toLowerCase())) {
    return { color: value, style: value, width: value };
  }

  const parts: Record<string, string> = { ...BORDER_INITIAL_VALUES };

  for (const component of components(value)) {
    const keyword = component.toLowerCase();

    if (BORDER_STYLE_KEYWORDS.has(keyword)) {
      parts.style = component;
    } else if (
      BORDER_WIDTH_KEYWORDS.has(keyword) ||
      NUMERIC_REGEX.test(component) ||
      CALC_REGEX.test(component)
    ) {
      parts.width = component;
    } else {
      parts.color = component;
    }
  }

  return parts;
}

function longhands(property: string, value: string) {
  const keys = QUAD_SHORTHANDS.get(property);
  if (keys) {
    // the elliptical form carries two radii per corner, which no longhand holds
    if (property === 'border-radius' && value.includes('/')) {
      return null;
    }

    const values = edges(components(value));
    return values && zip(keys, values);
  }

  if (property === 'border') {
    const expanded: Record<string, string> = {};
    for (const [part, partValue] of Object.entries(border(value))) {
      for (const key of QUAD_SHORTHANDS.get(`border-${part}`)!) {
        expanded[key] = partValue;
      }
    }

    return expanded;
  }

  const sideKeys = BORDER_SIDE_SHORTHANDS.get(property);
  if (sideKeys) {
    const expanded: Record<string, string> = {};
    for (const [part, partValue] of Object.entries(border(value))) {
      expanded[sideKeys[part]!] = partValue;
    }

    return expanded;
  }

  return null;
}

function pick(entries: Entry[], keys: string[]) {
  const found: { index: number; value: string }[] = [];

  for (const key of keys) {
    const index = entries.findIndex(([property]) => property === key);
    const entry = entries[index];
    if (!entry) {
      return null;
    }

    found.push({ index, value: entry[1] });
  }

  return found;
}

// the shorthand takes the place of the first longhand it replaces, so the
// declaration order the caller wrote is the order it gets back
function replace(
  entries: Entry[],
  keys: string[],
  shorthand: string,
  build: (values: string[]) => string | null
) {
  const found = pick(entries, keys);
  if (!found) {
    return entries;
  }

  const value = build(found.map((item) => item.value));
  if (value === null) {
    return entries;
  }

  const at = Math.min(...found.map((item) => item.index));
  const removed = new Set(found.map((item) => item.index));

  const next: Entry[] = [];
  entries.forEach((entry, index) => {
    if (index === at) {
      next.push([shorthand, value]);
    } else if (!removed.has(index)) {
      next.push(entry);
    }
  });

  return next;
}

function single(values: string[]) {
  const [width, style, color] = values;
  if (width === undefined || style === undefined || color === undefined) {
    return null;
  }

  // `border` says one thing per part, so a per-side value cannot be written
  if ([width, style, color].some((part) => WHITESPACE_REGEX.test(part))) {
    return null;
  }

  return `${width} ${style} ${color}`;
}

export type ShorthandOptions = {
  camelCase: boolean;
};

/**
 * Rewrites every shorthand declaration as the longhands it stands for, so two
 * style objects can be merged without a shorthand on one side resetting an
 * edge the other side set for itself.
 *
 * Parts a shorthand leaves out are filled with their initial values, as the
 * cascade requires — `border: solid` yields a `medium` width and a
 * `currentcolor` colour. `border-image`, which `border` also resets, is left
 * alone so that the result holds longhands only.
 */
export function expand(
  object: Record<string, string>,
  options: Partial<ShorthandOptions> = {}
) {
  options.camelCase ??= false;

  const cast = (property: string) =>
    options.camelCase ? camel(property) : property;

  const expanded: Record<string, string> = {};
  for (const [property, value] of Object.entries(object)) {
    const canonical = kebabCase(property);
    const { bare, important } = priority(value);
    const parts = bare === '' ? null : longhands(canonical, bare);

    if (!parts) {
      expanded[cast(canonical)] = value;
      continue;
    }

    for (const [part, partValue] of Object.entries(parts)) {
      expanded[cast(part)] = important
        ? `${partValue} ${important}`
        : partValue;
    }
  }

  return expanded;
}

/**
 * The inverse of `expand`: where every longhand behind a shorthand is present,
 * the group is replaced by the shortest shorthand that says the same thing. A
 * group missing any of its longhands is left alone, so nothing is invented.
 */
export function collapse(
  object: Record<string, string>,
  options: Partial<ShorthandOptions> = {}
) {
  options.camelCase ??= false;

  let entries: Entry[] = Object.entries(object).map(([property, value]) => [
    kebabCase(property),
    value,
  ]);

  for (const [shorthand, keys] of QUAD_SHORTHANDS) {
    entries = replace(entries, keys, shorthand, shortest);
  }

  entries = replace(entries, BORDER_PART_SHORTHANDS, 'border', single);

  const collapsed: Record<string, string> = {};
  for (const [property, value] of entries) {
    collapsed[options.camelCase ? camel(property) : property] = value;
  }

  return collapsed;
}
