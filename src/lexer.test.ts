import { expect, test } from 'vitest';

import { lex } from './lexer';
import { TOKEN_KINDS } from './token';
import type { Token } from './token';

type Case = [string, Token[]];

const cases: Case[] = [
  [
    '(: ) ',
    [
      {
        kind: TOKEN_KINDS.IDENT,
        value: '(',
        start: { line: 1, column: 1 },
        end: { line: 1, column: 2 },
      },
      {
        kind: TOKEN_KINDS.COLON,
        value: ':',
        start: { line: 1, column: 2 },
        end: { line: 1, column: 3 },
      },
      {
        kind: TOKEN_KINDS.WHITESPACE,
        value: ' ',
        start: { line: 1, column: 3 },
        end: { line: 1, column: 4 },
      },
      {
        kind: TOKEN_KINDS.IDENT,
        value: ')',
        start: { line: 1, column: 4 },
        end: { line: 1, column: 5 },
      },
      {
        kind: TOKEN_KINDS.WHITESPACE,
        value: ' ',
        start: { line: 1, column: 5 },
        end: { line: 1, column: 6 },
      },
      {
        kind: TOKEN_KINDS.EOF,
        value: '',
        start: { line: 1, column: 6 },
        end: { line: 1, column: 6 },
      },
    ],
  ],
  [
    '/* comment \n comment */',
    [
      {
        kind: TOKEN_KINDS.COMMENT,
        value: '/* comment \n comment */',
        start: { line: 1, column: 1 },
        end: { line: 2, column: 12 },
      },
      {
        kind: TOKEN_KINDS.EOF,
        value: '',
        start: { line: 2, column: 12 },
        end: { line: 2, column: 12 },
      },
    ],
  ],
  [
    '\n\r\f',
    [
      {
        kind: TOKEN_KINDS.WHITESPACE,
        value: '\n\r\f',
        start: { line: 1, column: 1 },
        end: { line: 2, column: 3 },
      },
      {
        kind: TOKEN_KINDS.EOF,
        value: '',
        start: { line: 2, column: 3 },
        end: { line: 2, column: 3 },
      },
    ],
  ],
  [
    '"foo"',
    [
      {
        kind: TOKEN_KINDS.STRING,
        value: '"foo"',
        start: { line: 1, column: 1 },
        end: { line: 1, column: 6 },
      },
      {
        kind: TOKEN_KINDS.EOF,
        value: '',
        start: { line: 1, column: 6 },
        end: { line: 1, column: 6 },
      },
    ],
  ],
  [
    "'foo'",
    [
      {
        kind: TOKEN_KINDS.STRING,
        value: "'foo'",
        start: { line: 1, column: 1 },
        end: { line: 1, column: 6 },
      },
      {
        kind: TOKEN_KINDS.EOF,
        value: '',
        start: { line: 1, column: 6 },
        end: { line: 1, column: 6 },
      },
    ],
  ],
  [
    '"foo" \'bar\'',
    [
      {
        kind: TOKEN_KINDS.STRING,
        value: '"foo"',
        start: { line: 1, column: 1 },
        end: { line: 1, column: 6 },
      },
      {
        kind: TOKEN_KINDS.WHITESPACE,
        value: ' ',
        start: { line: 1, column: 6 },
        end: { line: 1, column: 7 },
      },
      {
        kind: TOKEN_KINDS.STRING,
        value: "'bar'",
        start: { line: 1, column: 7 },
        end: { line: 1, column: 12 },
      },
      {
        kind: TOKEN_KINDS.EOF,
        value: '',
        start: { line: 1, column: 12 },
        end: { line: 1, column: 12 },
      },
    ],
  ],
  [
    '"foo\\"bar\\""',
    [
      {
        kind: TOKEN_KINDS.STRING,
        value: '"foo\\"bar\\""',
        start: { line: 1, column: 1 },
        end: { line: 1, column: 13 },
      },
      {
        kind: TOKEN_KINDS.EOF,
        value: '',
        start: { line: 1, column: 13 },
        end: { line: 1, column: 13 },
      },
    ],
  ],
  [
    ' color: red; ',
    [
      {
        kind: TOKEN_KINDS.WHITESPACE,
        value: ' ',
        start: { line: 1, column: 1 },
        end: { line: 1, column: 2 },
      },
      {
        kind: TOKEN_KINDS.IDENT,
        value: 'color',
        start: { line: 1, column: 2 },
        end: { line: 1, column: 7 },
      },
      {
        kind: TOKEN_KINDS.COLON,
        value: ':',
        start: { line: 1, column: 7 },
        end: { line: 1, column: 8 },
      },
      {
        kind: TOKEN_KINDS.WHITESPACE,
        value: ' ',
        start: { line: 1, column: 8 },
        end: { line: 1, column: 9 },
      },
      {
        kind: TOKEN_KINDS.IDENT,
        value: 'red',
        start: { line: 1, column: 9 },
        end: { line: 1, column: 12 },
      },
      {
        kind: TOKEN_KINDS.SEMICOLON,
        value: ';',
        start: { line: 1, column: 12 },
        end: { line: 1, column: 13 },
      },
      {
        kind: TOKEN_KINDS.WHITESPACE,
        value: ' ',
        start: { line: 1, column: 13 },
        end: { line: 1, column: 14 },
      },
      {
        kind: TOKEN_KINDS.EOF,
        value: '',
        start: { line: 1, column: 14 },
        end: { line: 1, column: 14 },
      },
    ],
  ],
  [
    'text-align/**/ /*:*/ : /*:*//**/ center',
    [
      {
        kind: TOKEN_KINDS.IDENT,
        value: 'text-align',
        start: { line: 1, column: 1 },
        end: { line: 1, column: 11 },
      },
      {
        kind: TOKEN_KINDS.COMMENT,
        value: '/**/',
        start: { line: 1, column: 11 },
        end: { line: 1, column: 15 },
      },
      {
        kind: TOKEN_KINDS.WHITESPACE,
        value: ' ',
        start: { line: 1, column: 15 },
        end: { line: 1, column: 16 },
      },
      {
        kind: TOKEN_KINDS.COMMENT,
        value: '/*:*/',
        start: { line: 1, column: 16 },
        end: { line: 1, column: 21 },
      },
      {
        kind: TOKEN_KINDS.WHITESPACE,
        value: ' ',
        start: { line: 1, column: 21 },
        end: { line: 1, column: 22 },
      },
      {
        kind: TOKEN_KINDS.COLON,
        value: ':',
        start: { line: 1, column: 22 },
        end: { line: 1, column: 23 },
      },
      {
        kind: TOKEN_KINDS.WHITESPACE,
        value: ' ',
        start: { line: 1, column: 23 },
        end: { line: 1, column: 24 },
      },
      {
        kind: TOKEN_KINDS.COMMENT,
        value: '/*:*/',
        start: { line: 1, column: 24 },
        end: { line: 1, column: 29 },
      },
      {
        kind: TOKEN_KINDS.COMMENT,
        value: '/**/',
        start: { line: 1, column: 29 },
        end: { line: 1, column: 33 },
      },
      {
        kind: TOKEN_KINDS.WHITESPACE,
        value: ' ',
        start: { line: 1, column: 33 },
        end: { line: 1, column: 34 },
      },
      {
        kind: TOKEN_KINDS.IDENT,
        value: 'center',
        start: { line: 1, column: 34 },
        end: { line: 1, column: 40 },
      },
      {
        kind: TOKEN_KINDS.EOF,
        value: '',
        start: { line: 1, column: 40 },
        end: { line: 1, column: 40 },
      },
    ],
  ],
  [
    '/*',
    [
      {
        kind: TOKEN_KINDS.BAD_COMMENT,
        value: '/*',
        start: { line: 1, column: 1 },
        end: { line: 1, column: 3 },
      },
      {
        kind: TOKEN_KINDS.EOF,
        value: '',
        start: { line: 1, column: 3 },
        end: { line: 1, column: 3 },
      },
    ],
  ],
  [
    '"foo',
    [
      {
        kind: TOKEN_KINDS.BAD_STRING,
        value: '"foo',
        start: { line: 1, column: 1 },
        end: { line: 1, column: 5 },
      },
      {
        kind: TOKEN_KINDS.EOF,
        value: '',
        start: { line: 1, column: 5 },
        end: { line: 1, column: 5 },
      },
    ],
  ],
  [
    '"foo\\"',
    [
      {
        kind: TOKEN_KINDS.BAD_STRING,
        value: '"foo\\"',
        start: { line: 1, column: 1 },
        end: { line: 1, column: 7 },
      },
      {
        kind: TOKEN_KINDS.EOF,
        value: '',
        start: { line: 1, column: 7 },
        end: { line: 1, column: 7 },
      },
    ],
  ],
  [
    'color: #ff0000;',
    [
      {
        kind: TOKEN_KINDS.IDENT,
        value: 'color',
        start: { line: 1, column: 1 },
        end: { line: 1, column: 6 },
      },
      {
        kind: TOKEN_KINDS.COLON,
        value: ':',
        start: { line: 1, column: 6 },
        end: { line: 1, column: 7 },
      },
      {
        kind: TOKEN_KINDS.WHITESPACE,
        value: ' ',
        start: { line: 1, column: 7 },
        end: { line: 1, column: 8 },
      },
      {
        kind: TOKEN_KINDS.IDENT,
        value: '#ff0000',
        start: { line: 1, column: 8 },
        end: { line: 1, column: 15 },
      },
      {
        kind: TOKEN_KINDS.SEMICOLON,
        value: ';',
        start: { line: 1, column: 15 },
        end: { line: 1, column: 16 },
      },
      {
        kind: TOKEN_KINDS.EOF,
        value: '',
        start: { line: 1, column: 16 },
        end: { line: 1, column: 16 },
      },
    ],
  ],
];

test.each(cases)('should lex `%s`', (source, tokens) => {
  const result = lex(source);
  expect(result).toEqual(tokens);
});
