import { expect, test } from 'vitest';
import type { Node } from './ast';
import { parse } from './parser';
import { TOKEN_KINDS } from './token';

type Case = [string, Node[]];

const cases: Case[] = [
  [
    '/* comment */',
    [
      {
        type: 'comment',
        value: ' comment ',
        start: { line: 1, column: 1 },
        end: { line: 1, column: 14 },
      },
    ],
  ],
  [
    '/* comment \n comment */',
    [
      {
        type: 'comment',
        value: ' comment \n comment ',
        start: { line: 1, column: 1 },
        end: { line: 2, column: 12 },
      },
    ],
  ],
  [
    '/* comment */ /* comment */',
    [
      {
        type: 'comment',
        value: ' comment ',
        start: { line: 1, column: 1 },
        end: { line: 1, column: 14 },
      },
      {
        type: 'comment',
        value: ' comment ',
        start: { line: 1, column: 15 },
        end: { line: 1, column: 28 },
      },
    ],
  ],
  [
    ' color: red; ',
    [
      {
        type: 'declaration',
        property: 'color',
        value: 'red',
        start: { line: 1, column: 2 },
        end: { line: 1, column: 13 },
      },
    ],
  ],
  [
    'text-align/**/ /*:*/ : /*:*//**/ center',
    [
      {
        type: 'declaration',
        property: 'text-align',
        value: 'center',
        start: { line: 1, column: 1 },
        end: { line: 1, column: 40 },
      },
    ],
  ],
];

test.each(cases)('should parse `%s`', (source, nodes) => {
  const result = parse(source);
  expect(result).toEqual(nodes);
});

const snapshots = [
  [
    'parses when comment precedes colon',
    'text-align/**/ /*:*/ : /*:*//**/ center',
  ],
  ['parses single declaration', 'background-color: #C0FFEE;'],
  [
    'parse multiple declarations',
    `background: -webkit-gradient(linear, left top, left bottom, from(white), to(black));
      content  :  " "  ; /* comment */
      foo:bar;-o-transition:all .5s`,
  ],
];

test.each(snapshots)('should parse `%s`', (description, source) => {
  const result = parse(source);
  expect(result).toMatchSnapshot();
});

const errors: [unknown, string][] = [
  ...([
    undefined,
    null,
    true,
    false,
    NaN,
    0,
    1,
    {},
    ['Array'],
    new Date(),
    () => Function,
  ].map((value) => [
    value,
    `Expected first argument to be a string, got ${typeof value}`,
  ]) as [unknown, string][]),
  [
    'overflow',
    `Expected ':' after property overflow, got '${TOKEN_KINDS.EOF}'`,
  ],
  ['/* comment', 'Unterminated comment: /* comment'],
];

test.each(errors)('should throw `%s`', (value, message) => {
  expect(() => parse(value)).toThrow(message);
});
