import inlineStyleParser from 'inline-style-parser';
import { bench, group, run, summary } from 'mitata';
import { parse } from '../src/parser';

const testCases = [
  'color: red;',
  'font-size: .75em; position:absolute;width: 33.3%; z-index:1337;',
  '-webkit-transition: all 4s ease; -moz-transition: all 4s ease; -ms-transition: all 4s ease; -o-transition: all 4s ease; transition: all 4s ease;',
  'top: 0; /* comment */ bottom: 42rem; /* another comment */',
  'font-family: "Goudy Bookletter 1911", Gill Sans Extrabold, sans-serif;',
  'background: #123456 url("https://foo.bar/image.png?v=2")',
  `
    -moz-border-radius: 10px 5px;
    -webkit-border-top-left-radius: 10px;
    -webkit-border-top-right-radius: 5px;
    -webkit-border-bottom-right-radius: 10px;
    -webkit-border-bottom-left-radius: 5px;
    border-radius: 10px 5px;
  `,
  'display: flex; flex-direction: column; align-items: center; justify-content: space-between; padding: 1rem 2rem; margin: 0 auto; background-color: #ffffff; border: 1px solid rgba(0,0,0,0.1); border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.05);',
];

for (const [index, css] of testCases.entries()) {
  summary(() => {
    group(
      `Case ${index + 1}: ${css.slice(0, 50)}${css.length > 50 ? '...' : ''}`,
      () => {
        bench('inline-style-parser', () => {
          inlineStyleParser(css);
        });

        bench('custom parser', () => {
          parse(css);
        });
      }
    );
  });
}

summary(() => {
  group('Parsing all test cases', () => {
    bench('inline-style-parser', () => {
      for (const css of testCases) {
        inlineStyleParser(css);
      }
    });

    bench('custom parser', () => {
      for (const css of testCases) {
        parse(css);
      }
    });
  });
});

await run();
