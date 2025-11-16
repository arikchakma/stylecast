import type { Comment, Declaration, Node } from './ast';
import { Lexer } from './lexer';
import type { Token } from './token';
import { TOKEN_KINDS } from './token';

export class Parser {
  private lexer: Lexer;
  private currentToken: Token;
  private peekToken: Token;

  constructor(source: string) {
    this.lexer = new Lexer(source);
    this.currentToken = this.lexer.readNextToken();
    this.peekToken = this.lexer.readNextToken();
  }

  private advance(): void {
    this.currentToken = this.peekToken;
    this.peekToken = this.lexer.readNextToken();
  }

  private declaration(): Declaration {
    const startToken = this.currentToken;
    const property = this.currentToken.value;
    this.advance();

    while (true) {
      const kind = this.currentToken.kind;
      if (kind === TOKEN_KINDS.COLON || kind === TOKEN_KINDS.EOF) {
        break;
      }

      this.advance();
    }

    let currentKind = this.currentToken.kind;
    if (currentKind !== TOKEN_KINDS.COLON) {
      throw new Error(
        `Expected ':' after property ${property}, got '${currentKind}' at ${this.currentToken.start.line}:${this.currentToken.start.column}`
      );
    }

    this.advance();

    let value = '';
    let lastValueToken = this.currentToken;
    while (true) {
      const kind = this.currentToken.kind;
      if (kind === TOKEN_KINDS.SEMICOLON || kind === TOKEN_KINDS.EOF) {
        break;
      }

      if (kind === TOKEN_KINDS.COMMENT) {
        this.advance();
        continue;
      }

      value += this.currentToken.value;
      lastValueToken = this.currentToken;
      this.advance();
    }

    currentKind = this.currentToken.kind;
    if (
      currentKind !== TOKEN_KINDS.SEMICOLON &&
      currentKind !== TOKEN_KINDS.EOF
    ) {
      throw new Error(
        `Expected semicolon after value ${value} at ${this.currentToken.start.line}:${this.currentToken.start.column}`
      );
    }

    const endToken =
      currentKind === TOKEN_KINDS.SEMICOLON
        ? this.currentToken
        : lastValueToken;

    return {
      type: 'declaration',
      property,
      value: value.trim(),
      start: startToken.start,
      end: endToken.end,
    };
  }

  private comment(): Comment {
    const commentToken = this.currentToken;
    const node: Comment = {
      type: 'comment',
      /// we strip the /* and */ from the value
      /// to match the inline-style-parser output
      value: commentToken.value.slice(2, -2),
      start: commentToken.start,
      end: commentToken.end,
    };

    this.advance();
    return node;
  }

  parse() {
    const declarations: Node[] = [];

    while (this.currentToken.kind !== TOKEN_KINDS.EOF) {
      switch (this.currentToken.kind) {
        case TOKEN_KINDS.COMMENT:
          declarations.push(this.comment());
          break;
        case TOKEN_KINDS.IDENT:
          declarations.push(this.declaration());
          break;
        case TOKEN_KINDS.BAD_COMMENT:
          throw new Error(
            'Unterminated comment: ' +
              this.currentToken.value +
              ' at ' +
              this.currentToken.start.line +
              ':' +
              this.currentToken.start.column
          );
        case TOKEN_KINDS.BAD_STRING:
          throw new Error(
            'Unterminated string: ' +
              this.currentToken.value +
              ' at ' +
              this.currentToken.start.line +
              ':' +
              this.currentToken.start.column
          );
        default:
          this.advance();
          continue;
      }
    }

    return declarations;
  }
}

export function parse(source: unknown): Node[] {
  if (typeof source !== 'string') {
    throw new Error(
      'Expected first argument to be a string, got ' + typeof source
    );
  }

  const parser = new Parser(source);
  return parser.parse();
}

export function declarations(source: unknown): Declaration[] {
  const nodes = parse(source);
  return nodes.filter(
    (node): node is Declaration => node.type === 'declaration'
  );
}
