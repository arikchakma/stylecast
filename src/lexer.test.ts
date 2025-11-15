import { expect, test } from 'vitest';
import { lex } from './lexer';
import { TOKEN_KINDS, type Token } from './token';

type Case = [string, Token[]];

const cases: Case[] = [
  [
    '(: ) ',
    [
      { kind: TOKEN_KINDS.IDENT, value: '(' },
      { kind: TOKEN_KINDS.COLON, value: ':' },
      { kind: TOKEN_KINDS.WHITESPACE, value: ' ' },
      { kind: TOKEN_KINDS.IDENT, value: ')' },
      { kind: TOKEN_KINDS.WHITESPACE, value: ' ' },
      { kind: TOKEN_KINDS.EOF, value: '' },
    ],
  ],
  [
    '/* comment \n comment */',
    [
      { kind: TOKEN_KINDS.COMMENT, value: '/* comment \n comment */' },
      { kind: TOKEN_KINDS.EOF, value: '' },
    ],
  ],
  [
    '\n\r\f',
    [
      { kind: TOKEN_KINDS.WHITESPACE, value: '\n\r\f' },
      { kind: TOKEN_KINDS.EOF, value: '' },
    ],
  ],
  [
    '"foo"',
    [
      { kind: TOKEN_KINDS.STRING, value: '"foo"' },
      { kind: TOKEN_KINDS.EOF, value: '' },
    ],
  ],
  [
    "'foo'",
    [
      { kind: TOKEN_KINDS.STRING, value: "'foo'" },
      { kind: TOKEN_KINDS.EOF, value: '' },
    ],
  ],
  [
    '"foo" \'bar\'',
    [
      { kind: TOKEN_KINDS.STRING, value: '"foo"' },
      { kind: TOKEN_KINDS.WHITESPACE, value: ' ' },
      { kind: TOKEN_KINDS.STRING, value: "'bar'" },
      { kind: TOKEN_KINDS.EOF, value: '' },
    ],
  ],
  [
    '"foo\\"bar\\""',
    [
      {
        kind: TOKEN_KINDS.STRING,
        value: '"foo\\"bar\\""',
      },
      { kind: TOKEN_KINDS.EOF, value: '' },
    ],
  ],
  [
    ' color: red; ',
    [
      { kind: TOKEN_KINDS.WHITESPACE, value: ' ' },
      { kind: TOKEN_KINDS.IDENT, value: 'color' },
      { kind: TOKEN_KINDS.COLON, value: ':' },
      { kind: TOKEN_KINDS.WHITESPACE, value: ' ' },
      { kind: TOKEN_KINDS.IDENT, value: 'red' },
      { kind: TOKEN_KINDS.SEMICOLON, value: ';' },
      { kind: TOKEN_KINDS.WHITESPACE, value: ' ' },
      { kind: TOKEN_KINDS.EOF, value: '' },
    ],
  ],
  [
    'text-align/**/ /*:*/ : /*:*//**/ center',
    [
      { kind: TOKEN_KINDS.IDENT, value: 'text-align' },
      { kind: TOKEN_KINDS.COMMENT, value: '/**/' },
      { kind: TOKEN_KINDS.WHITESPACE, value: ' ' },
      { kind: TOKEN_KINDS.COMMENT, value: '/*:*/' },
      { kind: TOKEN_KINDS.WHITESPACE, value: ' ' },
      { kind: TOKEN_KINDS.COLON, value: ':' },
      { kind: TOKEN_KINDS.WHITESPACE, value: ' ' },
      { kind: TOKEN_KINDS.COMMENT, value: '/*:*/' },
      { kind: TOKEN_KINDS.COMMENT, value: '/**/' },
      { kind: TOKEN_KINDS.WHITESPACE, value: ' ' },
      { kind: TOKEN_KINDS.IDENT, value: 'center' },
      { kind: TOKEN_KINDS.EOF, value: '' },
    ],
  ],
  [
    '/*',
    [
      { kind: TOKEN_KINDS.BAD_COMMENT, value: '/*' },
      { kind: TOKEN_KINDS.EOF, value: '' },
    ],
  ],
  [
    '"foo',
    [
      { kind: TOKEN_KINDS.BAD_STRING, value: '"foo' },
      { kind: TOKEN_KINDS.EOF, value: '' },
    ],
  ],
  [
    '"foo\\"',
    [
      { kind: TOKEN_KINDS.BAD_STRING, value: '"foo\\"' },
      { kind: TOKEN_KINDS.EOF, value: '' },
    ],
  ],
];

test.each(cases)('should lex `%s`', (source, tokens) => {
  const result = lex(source);
  expect(result).toEqual(tokens);
});
