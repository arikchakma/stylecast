import type { Token, TokenKind } from './token';
import { TOKEN_KINDS } from './token';

export const NEWLINE = '\n';
export const CARRIAGE_RETURN = '\r';
export const NEWLINE_SEQUENCE = '\r\n';
export const FORM_FEED = '\f';

export const SPACE = ' ';
export const TAB = '\t';

export const COLON = ':';
export const SEMICOLON = ';';
export const COMMA = ',';

export const QUOTATION_MARK = '"';
export const APOSTROPHE = "'";

export const SLASH = '/';
export const BACKSLASH = '\\';
export const ASTERISK = '*';

const FIXED_IDENT_CHARS = new Set([
  COLON,
  SEMICOLON,
  COMMA,
  QUOTATION_MARK,
  APOSTROPHE,
  SLASH,
  BACKSLASH,
  ASTERISK,
]);

export class Lexer {
  private source: string;
  private length: number;
  public position: number;

  constructor(source: string) {
    this.source = source;
    this.length = source.length;
    this.position = 0;
  }

  private peek(offset: number = 0): string | null {
    const targetPosition = this.position + offset;
    if (targetPosition >= this.length) {
      return null;
    }

    return this.source[targetPosition] ?? null;
  }

  private consume(): string | null {
    const char = this.peek();
    if (char !== null) {
      this.position += 1;
    }

    return char;
  }

  private isEndOfFile(): boolean {
    return this.position >= this.length;
  }

  private isWhitespace(char: string): boolean {
    return (
      char === SPACE ||
      char === TAB ||
      char === NEWLINE ||
      char === CARRIAGE_RETURN ||
      char === FORM_FEED
    );
  }

  private whitespace(): Token {
    const start = this.position;
    // loop until we find a non-whitespace character
    // so that we can merge multiple whitespace characters into a single token
    while (true) {
      const char = this.peek();
      if (char === null || !this.isWhitespace(char)) {
        break;
      }

      this.consume();
    }

    return this.token(
      TOKEN_KINDS.WHITESPACE,
      this.source.slice(start, this.position)
    );
  }

  private comment(): Token {
    const start = this.position;
    this.consume();
    this.consume();

    while (this.peek() !== null) {
      const char = this.consume();
      if (char === ASTERISK && this.peek() === SLASH) {
        this.consume();
        break;
      }
    }

    const value = this.source.slice(start, this.position);
    if (!value.endsWith(ASTERISK + SLASH)) {
      return this.token(TOKEN_KINDS.BAD_COMMENT, value);
    }

    return this.token(TOKEN_KINDS.COMMENT, value);
  }

  private isNewLine(char: string): boolean {
    return (
      char === NEWLINE || char === CARRIAGE_RETURN || char === NEWLINE_SEQUENCE
    );
  }

  private string(): Token {
    const start = this.position;
    const first = this.consume();

    while (true) {
      const char = this.peek();
      if (char === null || char === first) {
        break;
      }

      if (char === BACKSLASH) {
        this.consume();
        const escapedChar = this.consume();
        if (escapedChar === null) {
          return this.token(
            TOKEN_KINDS.BAD_STRING,
            this.source.slice(start, this.position)
          );
        }

        if (this.isNewLine(escapedChar)) {
          continue;
        }

        continue;
      }

      this.consume();
    }

    if (this.peek() !== first) {
      return this.token(
        TOKEN_KINDS.BAD_STRING,
        this.source.slice(start, this.position)
      );
    }

    this.consume();
    return this.token(
      TOKEN_KINDS.STRING,
      this.source.slice(start, this.position)
    );
  }

  private ident(): Token {
    const start = this.position;
    this.consume();

    while (true) {
      const char = this.peek();
      if (
        char === null ||
        this.isWhitespace(char) ||
        FIXED_IDENT_CHARS.has(char)
      ) {
        break;
      }

      this.consume();
    }

    return this.token(
      TOKEN_KINDS.IDENT,
      this.source.slice(start, this.position)
    );
  }

  private token(kind: TokenKind, value: string): Token {
    return { kind, value };
  }

  readNextToken(): Token {
    if (this.isEndOfFile()) {
      return this.token(TOKEN_KINDS.EOF, '');
    }

    const peeked = this.peek();
    if (peeked === SLASH && this.peek(1) === ASTERISK) {
      return this.comment();
    }

    switch (peeked) {
      case COLON:
        this.consume();
        return this.token(TOKEN_KINDS.COLON, peeked);
      case SEMICOLON:
        this.consume();
        return this.token(TOKEN_KINDS.SEMICOLON, peeked);
      case COMMA:
        this.consume();
        return this.token(TOKEN_KINDS.COMMA, peeked);
      case SLASH:
        this.consume();
        if (this.peek() === ASTERISK) {
          return this.comment();
        }

        return this.token(TOKEN_KINDS.DELIM, peeked);
      /// all of these are whitespace
      /// @see https://www.w3.org/TR/2021/CRD-css-syntax-3-20211224/#whitespace-diagram
      case SPACE:
      case TAB:
      case NEWLINE:
      case CARRIAGE_RETURN:
      case NEWLINE_SEQUENCE:
      case FORM_FEED:
        return this.whitespace();
      case QUOTATION_MARK:
      case APOSTROPHE:
        return this.string();
      default:
        return this.ident();
    }
  }
}

export function lex(source: string): Token[] {
  const lexer = new Lexer(source);
  const tokens: Token[] = [];
  while (true) {
    const token = lexer.readNextToken();
    if (token.kind === TOKEN_KINDS.EOF) {
      tokens.push(token);
      break;
    }

    tokens.push(token);
  }

  return tokens;
}
