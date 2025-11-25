import type { Token } from './token';
import { TOKEN_KINDS } from './token';

const NEWLINE = '\n'.charCodeAt(0);
const CARRIAGE_RETURN = '\r'.charCodeAt(0);
const FORM_FEED = '\f'.charCodeAt(0);
const SPACE = ' '.charCodeAt(0);
const TAB = '\t'.charCodeAt(0);

const SLASH = '/'.charCodeAt(0);
const ASTERISK = '*'.charCodeAt(0);
const COLON = ':'.charCodeAt(0);
const SEMICOLON = ';'.charCodeAt(0);
const COMMA = ','.charCodeAt(0);
const BACKSLASH = '\\'.charCodeAt(0);
const QUOTE = '"'.charCodeAt(0);
const APOSTROPHE = "'".charCodeAt(0);

const FIXED_IDENT_CHARS = new Set([
  COLON,
  SEMICOLON,
  COMMA,
  QUOTE,
  APOSTROPHE,
  SLASH,
  BACKSLASH,
  ASTERISK,
]);

export class Lexer {
  private source: string;
  private bytes: Uint8Array;
  private length: number;

  public position: number;
  public line: number;
  public column: number;

  constructor(source: string) {
    this.source = source;
    this.bytes = new TextEncoder().encode(source);
    this.length = this.bytes.length;
    this.position = 0;
    this.line = 1;
    this.column = 1;
  }

  private peek(offset: number = 0): number | null {
    const targetPosition = this.position + offset;
    if (targetPosition >= this.length) {
      return null;
    }

    return this.bytes[targetPosition] ?? null;
  }

  private consume(): number | null {
    const b = this.peek();
    if (b === null) {
      return null;
    }

    this.position += 1;
    this.column += 1;

    if (b === NEWLINE) {
      this.line += 1;
      this.column = 1;
    }

    return b;
  }

  private isEndOfFile(): boolean {
    return this.position >= this.length;
  }

  private isWhitespace(b: number): boolean {
    return (
      b === SPACE ||
      b === TAB ||
      b === NEWLINE ||
      b === CARRIAGE_RETURN ||
      b === FORM_FEED
    );
  }

  private whitespace(): Token {
    const start = this.position;
    const startLine = this.line;
    const startColumn = this.column;

    while (true) {
      const b = this.peek();
      if (b === null || !this.isWhitespace(b)) {
        break;
      }

      this.consume();
    }

    return {
      kind: TOKEN_KINDS.WHITESPACE,
      value: this.source.slice(start, this.position),
      start: { line: startLine, column: startColumn },
      end: { line: this.line, column: this.column },
    };
  }

  private comment(): Token {
    const start = this.position;
    const startLine = this.line;
    const startColumn = this.column;

    this.consume();
    this.consume();

    while (this.peek() !== null) {
      const b = this.consume();
      if (b === ASTERISK && this.peek() === SLASH) {
        this.consume();
        break;
      }
    }

    const value = this.source.slice(start, this.position);
    const kind = value.endsWith(
      String.fromCharCode(ASTERISK) + String.fromCharCode(SLASH)
    )
      ? TOKEN_KINDS.COMMENT
      : TOKEN_KINDS.BAD_COMMENT;

    return {
      kind,
      value,
      start: { line: startLine, column: startColumn },
      end: { line: this.line, column: this.column },
    };
  }

  private isNewLine(b: number): boolean {
    return b === NEWLINE || b === CARRIAGE_RETURN;
  }

  private string(): Token {
    const start = this.position;
    const startLine = this.line;
    const startColumn = this.column;

    const first = this.consume();
    if (first === null) {
      return {
        kind: TOKEN_KINDS.BAD_STRING,
        value: this.source.slice(start, this.position),
        start: { line: startLine, column: startColumn },
        end: { line: this.line, column: this.column },
      };
    }

    while (true) {
      const b = this.peek();
      if (b === null || b === first) {
        break;
      }

      if (b === BACKSLASH) {
        this.consume();
        const escaped = this.consume();
        if (escaped === null) {
          return {
            kind: TOKEN_KINDS.BAD_STRING,
            value: this.source.slice(start, this.position),
            start: { line: startLine, column: startColumn },
            end: { line: this.line, column: this.column },
          };
        }

        if (this.isNewLine(escaped)) {
          continue;
        }

        continue;
      }

      this.consume();
    }

    if (this.peek() !== first) {
      return {
        kind: TOKEN_KINDS.BAD_STRING,
        value: this.source.slice(start, this.position),
        start: { line: startLine, column: startColumn },
        end: { line: this.line, column: this.column },
      };
    }

    this.consume();

    return {
      kind: TOKEN_KINDS.STRING,
      value: this.source.slice(start, this.position),
      start: { line: startLine, column: startColumn },
      end: { line: this.line, column: this.column },
    };
  }

  private ident(): Token {
    const start = this.position;
    const startLine = this.line;
    const startColumn = this.column;

    this.consume();

    while (true) {
      const b = this.peek();
      if (b === null || this.isWhitespace(b) || FIXED_IDENT_CHARS.has(b)) {
        break;
      }

      this.consume();
    }

    return {
      kind: TOKEN_KINDS.IDENT,
      value: this.source.slice(start, this.position),
      start: { line: startLine, column: startColumn },
      end: { line: this.line, column: this.column },
    };
  }

  readNextToken(): Token {
    if (this.isEndOfFile()) {
      return {
        kind: TOKEN_KINDS.EOF,
        value: '',
        start: { line: this.line, column: this.column },
        end: { line: this.line, column: this.column },
      };
    }

    const b = this.peek();
    if (b === null) {
      return {
        kind: TOKEN_KINDS.EOF,
        value: '',
        start: { line: this.line, column: this.column },
        end: { line: this.line, column: this.column },
      };
    }

    if (b === SLASH && this.peek(1) === ASTERISK) {
      return this.comment();
    }

    if (this.isWhitespace(b)) {
      return this.whitespace();
    }

    const ch = String.fromCharCode(b);

    switch (b) {
      case COLON: {
        const startLine = this.line;
        const startColumn = this.column;
        this.consume();
        return {
          kind: TOKEN_KINDS.COLON,
          value: ch,
          start: { line: startLine, column: startColumn },
          end: { line: this.line, column: this.column },
        };
      }
      case SEMICOLON: {
        const startLine = this.line;
        const startColumn = this.column;
        this.consume();
        return {
          kind: TOKEN_KINDS.SEMICOLON,
          value: ch,
          start: { line: startLine, column: startColumn },
          end: { line: this.line, column: this.column },
        };
      }
      case COMMA: {
        const startLine = this.line;
        const startColumn = this.column;
        this.consume();
        return {
          kind: TOKEN_KINDS.COMMA,
          value: ch,
          start: { line: startLine, column: startColumn },
          end: { line: this.line, column: this.column },
        };
      }
      case SLASH: {
        const startLine = this.line;
        const startColumn = this.column;
        this.consume();
        return {
          kind: TOKEN_KINDS.DELIM,
          value: ch,
          start: { line: startLine, column: startColumn },
          end: { line: this.line, column: this.column },
        };
      }
      /// all of these are whitespace
      /// @see https://www.w3.org/TR/2021/CRD-css-syntax-3-20211224/#whitespace-diagram
      case SPACE:
      case TAB:
      case NEWLINE:
      case CARRIAGE_RETURN:
      case FORM_FEED:
        return this.whitespace();
      case QUOTE:
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
    tokens.push(token);
    if (token.kind === TOKEN_KINDS.EOF) {
      break;
    }
  }

  return tokens;
}
