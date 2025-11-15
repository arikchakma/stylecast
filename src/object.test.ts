import { expect, test } from 'vitest';
import { objectify } from './object';
import { declarations } from './parser';

const cases = [
  // general
  ['display: inline-block;', { display: 'inline-block' }],
  ['color:red;', { color: 'red' }],
  ['margin: 0 auto;', { margin: '0 auto' }],
  [
    'font-size: .75em; position:absolute;width: 33.3%; z-index:1337;',
    {
      'font-size': '.75em',
      position: 'absolute',
      width: '33.3%',
      'z-index': '1337',
    },
  ],
  [
    'font-family: "Goudy Bookletter 1911", Gill Sans Extrabold, sans-serif;',
    {
      'font-family': '"Goudy Bookletter 1911", Gill Sans Extrabold, sans-serif',
    },
  ],

  // multiple of same property
  [
    'color:rgba(0,0,0,1);color:white;',
    {
      color: 'white',
    },
  ],

  // missing semicolon
  ['line-height: 42', { 'line-height': '42' }],
  [
    'font-style:italic; text-transform:uppercase',
    { 'font-style': 'italic', 'text-transform': 'uppercase' },
  ],

  // extra whitespace
  [' padding-bottom : 1px', { 'padding-bottom': '1px' }],
  ['padding:   12px  0 ', { padding: '12px  0' }],
  [
    `
      -moz-border-radius: 10px 5px;
      -webkit-border-top-left-radius: 10px;
      -webkit-border-top-right-radius: 5px;
      -webkit-border-bottom-right-radius: 10px;
      -webkit-border-bottom-left-radius: 5px;
      border-radius: 10px 5px;
    `,
    {
      '-moz-border-radius': '10px 5px',
      '-webkit-border-top-left-radius': '10px',
      '-webkit-border-top-right-radius': '5px',
      '-webkit-border-bottom-right-radius': '10px',
      '-webkit-border-bottom-left-radius': '5px',
      'border-radius': '10px 5px',
    },
  ],

  // text and url
  ['content: "Lorem ipsum";', { content: '"Lorem ipsum"' }],
  ['content: "foo: bar;";', { content: '"foo: bar;"' }],
  [
    'background-image: url("http://cdn.example.com/image.png?v=42");',
    {
      'background-image': 'url("http://cdn.example.com/image.png?v=42")',
    },
  ],
  [
    'background: #123456 url("https://foo.bar/image.png?v=2")',
    {
      background: '#123456 url("https://foo.bar/image.png?v=2")',
    },
  ],

  // property prefix
  [
    '-webkit-hyphens: auto; -moz-hyphens: auto; -ms-hyphens: auto; hyphens: auto;',
    {
      '-webkit-hyphens': 'auto',
      '-moz-hyphens': 'auto',
      '-ms-hyphens': 'auto',
      hyphens: 'auto',
    },
  ],

  // value prefix
  [
    'display: -webkit-box; display: -ms-flexbox; display: -webkit-flex; display: flex;',
    {
      display: 'flex',
    },
  ],

  // comment
  ['/* color: #f00; */ background: blue;', { background: 'blue' }],
  [
    'top: 0; /* comment */ bottom: 42rem;',
    {
      top: '0',
      bottom: '42rem',
    },
  ],
  [
    ` right: 0; /* comment */
    /* comment */   left: 42rem; `,
    {
      right: '0',
      left: '42rem',
    },
  ],

  // custom
  [
    'foo: bar;',
    {
      foo: 'bar',
    },
  ],
  ['foo:bar; baz:qux', { foo: 'bar', baz: 'qux' }],
  ['--custom-property: value;', { '--custom-property': 'value' }],
] as const;

test.each(cases)('should objectify `%s`', (source, object) =>
  expect(objectify(declarations(source))).toEqual(object)
);

const camelCaseCases = [
  // general
  ['display: inline-block;', { display: 'inline-block' }],
  ['color:red;', { color: 'red' }],
  ['margin: 0 auto;', { margin: '0 auto' }],
  [
    'font-size: .75em; position:absolute;width: 33.3%; z-index:1337;',
    {
      fontSize: '.75em',
      position: 'absolute',
      width: '33.3%',
      zIndex: '1337',
    },
  ],
  [
    'font-family: "Goudy Bookletter 1911", Gill Sans Extrabold, sans-serif;',
    {
      fontFamily: '"Goudy Bookletter 1911", Gill Sans Extrabold, sans-serif',
    },
  ],

  // multiple of same property
  [
    'color:rgba(0,0,0,1);color:white;',
    {
      color: 'white',
    },
  ],

  // missing semicolon
  ['line-height: 42', { lineHeight: '42' }],
  [
    'font-style:italic; text-transform:uppercase',
    { fontStyle: 'italic', textTransform: 'uppercase' },
  ],

  // extra whitespace
  [' padding-bottom : 1px', { paddingBottom: '1px' }],
  ['padding:   12px  0 ', { padding: '12px  0' }],
  [
    `
      -moz-border-radius: 10px 5px;
      -webkit-border-top-left-radius: 10px;
      -webkit-border-top-right-radius: 5px;
      -webkit-border-bottom-right-radius: 10px;
      -webkit-border-bottom-left-radius: 5px;
      border-radius: 10px 5px;
    `,
    {
      mozBorderRadius: '10px 5px',
      webkitBorderTopLeftRadius: '10px',
      webkitBorderTopRightRadius: '5px',
      webkitBorderBottomRightRadius: '10px',
      webkitBorderBottomLeftRadius: '5px',
      borderRadius: '10px 5px',
    },
  ],

  // text and url
  ['content: "Lorem ipsum";', { content: '"Lorem ipsum"' }],
  ['content: "foo: bar;";', { content: '"foo: bar;"' }],
  [
    'background-image: url("http://cdn.example.com/image.png?v=42");',
    {
      backgroundImage: 'url("http://cdn.example.com/image.png?v=42")',
    },
  ],
  [
    'background: #123456 url("https://foo.bar/image.png?v=2")',
    {
      background: '#123456 url("https://foo.bar/image.png?v=2")',
    },
  ],

  // property prefix
  [
    '-webkit-hyphens: auto; -moz-hyphens: auto; -ms-hyphens: auto; hyphens: auto;',
    {
      webkitHyphens: 'auto',
      mozHyphens: 'auto',
      msHyphens: 'auto',
      hyphens: 'auto',
    },
  ],

  // value prefix
  [
    'display: -webkit-box; display: -ms-flexbox; display: -webkit-flex; display: flex;',
    {
      display: 'flex',
    },
  ],

  // comment
  ['/* color: #f00; */ background: blue;', { background: 'blue' }],
  [
    'top: 0; /* comment */ bottom: 42rem;',
    {
      top: '0',
      bottom: '42rem',
    },
  ],
  [
    ` right: 0; /* comment */
    /* comment */   left: 42rem; `,
    {
      right: '0',
      left: '42rem',
    },
  ],

  // custom
  [
    'foo: bar;',
    {
      foo: 'bar',
    },
  ],
  ['--custom-property: value;', { '--custom-property': 'value' }],
] as const;

test.each(camelCaseCases)('should camelCase `%s`', (source, object) =>
  expect(objectify(declarations(source), { camelCase: true })).toEqual(object)
);

const reactifyCases = [
  [
    '-webkit-hyphens: auto; -moz-hyphens: auto; -ms-hyphens: auto; hyphens: auto;',
    {
      WebkitHyphens: 'auto',
      MozHyphens: 'auto',
      msHyphens: 'auto',
      hyphens: 'auto',
    },
  ],
  [
    '-webkit-transform: scale(1); -moz-transform: scale(1); -ms-transform: scale(1); -o-transform: scale(1); -khtml-transform: scale(1); transform: scale(1);',
    {
      WebkitTransform: 'scale(1)',
      MozTransform: 'scale(1)',
      msTransform: 'scale(1)',
      OTransform: 'scale(1)',
      KhtmlTransform: 'scale(1)',
      transform: 'scale(1)',
    },
  ],
  [
    'display: -webkit-box; display: -ms-flexbox; display: -webkit-flex; display: flex;',
    {
      display: 'flex',
    },
  ],
  [
    '/* color: #f00; */ background: blue;',
    {
      background: 'blue',
    },
  ],
  [
    'border-radius: 10px 5px; -webkit-border-top-left-radius: 10px; -webkit-border-top-right-radius: 5px; -webkit-border-bottom-right-radius: 10px; -webkit-border-bottom-left-radius: 5px;',
    {
      borderRadius: '10px 5px',
      WebkitBorderTopLeftRadius: '10px',
      WebkitBorderTopRightRadius: '5px',
      WebkitBorderBottomRightRadius: '10px',
      WebkitBorderBottomLeftRadius: '5px',
    },
  ],
  [
    '--custom-property: value;',
    {
      '--custom-property': 'value',
    },
  ],
] as const;

test.each(reactifyCases)('should reactify `%s`', (source, object) =>
  expect(objectify(declarations(source), { reactify: true })).toEqual(object)
);
