<div align="center">
  <h2>💈 StyleCast</h2>
  <p>A fast and lightweight inline CSS style parser for JavaScript and TypeScript.</p>
  <a href="https://npmjs.com/package/stylecast"><strong>npm</strong></a>
</div>

### What Does It Do?

**StyleCast** parses inline CSS strings into AST or JavaScript objects with optional React style camelCase conversion. It is designed to be fast and lightweight, and to be used in the browser or in Node.js.

```ts
import { parse, objectify } from 'stylecast';

const styles = parse('color: red;');
console.log(styles);
// [
//   {
//     type: 'declaration',
//     property: 'color',
//     value: 'red',
//   },
// ]

const object = objectify(styles);
console.log(object);
// { color: 'red' }
```

> [!NOTE]
> This library is designed to parse CSS from HTML `style` attributes (inline styles) only. It does not support the full CSS syntax including selectors, at-rules, media queries, or other CSS features outside of declaration blocks.

### Acknowledgements

This project was inspired by and learned from:

- [@csstools/css-tokenizer](https://github.com/csstools/postcss-plugins/tree/main/packages/css-tokenizer) - The lexer and tokenizer implementation draws inspiration from the CSS tokenization approach used in this project
- [inline-style-parser](https://github.com/remarkablemark/inline-style-parser) - Used as a reference implementation and for testing compatibility

Special thanks to the maintainers and contributors of these projects for their excellent work in the CSS parsing ecosystem.

### Contributing

Feel free to submit pull requests, create issues, or spread the word.

### License

MIT &copy; [Arik Chakma](https://x.com/imarikchakma)
