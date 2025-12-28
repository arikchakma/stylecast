import { describe, expect, it } from 'vitest';
import { stringify } from './string';

describe('stringify', () => {
  it('returns "" for empty object', () => {
    expect(stringify({})).toBe('');
  });

  it.each([
    [{ display: 'block' }, 'display: block;'],
    [{ color: 'red' }, 'color: red;'],
    [{ margin: '0 auto' }, 'margin: 0 auto;'],
    [{ padding: '10px 20px 30px 40px' }, 'padding: 10px 20px 30px 40px;'],
  ])('stringifies single property %s', (object, expected) => {
    expect(stringify(object)).toBe(expected);
  });

  it.each([
    [{ display: 'block', color: 'red' }, 'display: block; color: red;'],
    [
      { 'font-size': '16px', 'line-height': '1.5', 'font-weight': 'bold' },
      'font-size: 16px; line-height: 1.5; font-weight: bold;',
    ],
    [
      { margin: '0', padding: '10px', border: '1px solid black' },
      'margin: 0; padding: 10px; border: 1px solid black;',
    ],
  ])('stringifies multiple properties %s', (object, expected) => {
    expect(stringify(object)).toBe(expected);
  });

  it.each([
    [
      { 'font-family': '"Helvetica Neue", Arial, sans-serif' },
      'font-family: "Helvetica Neue", Arial, sans-serif;',
    ],
    [{ content: '"Hello World"' }, 'content: "Hello World";'],
    [
      { 'background-image': 'url("https://example.com/image.png")' },
      'background-image: url("https://example.com/image.png");',
    ],
    [
      { background: 'linear-gradient(to right, #ff0000, #0000ff)' },
      'background: linear-gradient(to right, #ff0000, #0000ff);',
    ],
  ])('stringifies values with special characters %s', (object, expected) => {
    expect(stringify(object)).toBe(expected);
  });

  it.each([
    [{ '-webkit-transform': 'scale(1)' }, '-webkit-transform: scale(1);'],
    [
      { '-moz-user-select': 'none', '-webkit-user-select': 'none' },
      '-moz-user-select: none; -webkit-user-select: none;',
    ],
    [
      { '-ms-hyphens': 'auto', hyphens: 'auto' },
      '-ms-hyphens: auto; hyphens: auto;',
    ],
  ])('stringifies vendor prefixes %s', (object, expected) => {
    expect(stringify(object)).toBe(expected);
  });

  it.each([
    [{ '--primary-color': '#007bff' }, '--primary-color: #007bff;'],
    [
      { '--spacing-sm': '8px', '--spacing-md': '16px', '--spacing-lg': '24px' },
      '--spacing-sm: 8px; --spacing-md: 16px; --spacing-lg: 24px;',
    ],
  ])('stringifies CSS custom properties %s', (object, expected) => {
    expect(stringify(object)).toBe(expected);
  });

  describe('option kebabCase is true', () => {
    const options = { kebabCase: true };

    it('returns "" for empty object', () => {
      expect(stringify({}, options)).toBe('');
    });

    it.each([
      [{ fontSize: '16px' }, 'font-size: 16px;'],
      [{ lineHeight: '1.5' }, 'line-height: 1.5;'],
      [{ backgroundColor: '#fff' }, 'background-color: #fff;'],
      [{ paddingBottom: '10px' }, 'padding-bottom: 10px;'],
      [{ borderRadius: '4px' }, 'border-radius: 4px;'],
      [{ zIndex: '100' }, 'z-index: 100;'],
    ])('converts camelCase property %s', (object, expected) => {
      expect(stringify(object, options)).toBe(expected);
    });

    it.each([
      [
        { fontSize: '16px', lineHeight: '1.5', fontWeight: 'bold' },
        'font-size: 16px; line-height: 1.5; font-weight: bold;',
      ],
      [
        { marginTop: '10px', marginBottom: '20px', paddingLeft: '15px' },
        'margin-top: 10px; margin-bottom: 20px; padding-left: 15px;',
      ],
    ])('converts multiple camelCase properties %s', (object, expected) => {
      expect(stringify(object, options)).toBe(expected);
    });

    it.each([
      [{ webkitTransform: 'scale(1)' }, '-webkit-transform: scale(1);'],
      [{ mozUserSelect: 'none' }, '-moz-user-select: none;'],
      [{ msTransform: 'rotate(45deg)' }, '-ms-transform: rotate(45deg);'],
      [{ oTransition: 'all 0.3s' }, '-o-transition: all 0.3s;'],
      [{ khtmlOpacity: '0.5' }, '-khtml-opacity: 0.5;'],
    ])('converts vendor prefix %s', (object, expected) => {
      expect(stringify(object, options)).toBe(expected);
    });

    it.each([
      [{ WebkitTransform: 'scale(1)' }, '-webkit-transform: scale(1);'],
      [{ MozUserSelect: 'none' }, '-moz-user-select: none;'],
      [{ OTransition: 'all 0.3s' }, '-o-transition: all 0.3s;'],
    ])('converts React-style vendor prefix %s', (object, expected) => {
      expect(stringify(object, options)).toBe(expected);
    });

    it.each([
      [{ '--primary-color': '#007bff' }, '--primary-color: #007bff;'],
      [{ '--customProperty': 'value' }, '--customProperty: value;'],
    ])('preserves CSS custom properties %s', (object, expected) => {
      expect(stringify(object, options)).toBe(expected);
    });

    it.each([
      [
        { fontSize: '16px', '--primary-color': '#007bff', display: 'flex' },
        'font-size: 16px; --primary-color: #007bff; display: flex;',
      ],
      [
        { webkitTransform: 'scale(1)', transform: 'scale(1)' },
        '-webkit-transform: scale(1); transform: scale(1);',
      ],
    ])('handles mixed properties %s', (object, expected) => {
      expect(stringify(object, options)).toBe(expected);
    });
  });
});
