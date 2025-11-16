export const TOKEN_KINDS = {
  // Comments
  COMMENT: 'comment', // /* ... */
  BAD_COMMENT: 'bad-comment', // /* ...

  // Separators
  COLON: 'colon-token', // :
  SEMICOLON: 'semicolon-token', // ;
  COMMA: 'comma-token', // ,
  WHITESPACE: 'whitespace-token', // spaces, tabs, newlines

  // Literals
  IDENT: 'ident-token', // color, background, solid, etc.
  STRING: 'string-token', // "Open Sans", 'Roboto'
  BAD_STRING: 'bad-string', // "Open Sans", 'Roboto'

  // Operators / delimiters
  DELIM: 'delim-token', // -, +, /, *, =, etc.

  // End of input
  EOF: 'EOF-token', // End of File
} as const;

export type TokenKind = (typeof TOKEN_KINDS)[keyof typeof TOKEN_KINDS];

export type Position = {
  line: number;
  column: number;
};

export interface Token {
  kind: TokenKind;
  value: string;
  start: Position;
  end: Position;
}
