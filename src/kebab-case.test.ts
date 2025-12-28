import { describe, expect, it } from 'vitest';

import { kebabCase } from './kebab-case';

describe('kebabCase', () => {
  it('returns "" for empty string', () => {
    expect(kebabCase('')).toBe('');
  });

  it.each([
    ['foo', 'foo'],
    ['foo-bar', 'foo-bar'],
    ['display', 'display'],
  ])('does not transform "%s"', (property, expected) => {
    expect(kebabCase(property)).toBe(expected);
  });

  it.each([
    ['--fooBar', '--fooBar'],
    ['--foo-bar', '--foo-bar'],
    ['--foo-100', '--foo-100'],
    ['--test_ing', '--test_ing'],
    ['--customProperty', '--customProperty'],
  ])('does not transform custom property "%s"', (property, expected) => {
    expect(kebabCase(property)).toBe(expected);
  });

  it.each([
    ['fooBar', 'foo-bar'],
    ['fooBarBaz', 'foo-bar-baz'],
    ['fontSize', 'font-size'],
    ['zIndex', 'z-index'],
    ['paddingBottom', 'padding-bottom'],
    ['borderRadius', 'border-radius'],
    ['backgroundColor', 'background-color'],
    ['marginTop', 'margin-top'],
    ['lineHeight', 'line-height'],
    ['textTransform', 'text-transform'],
  ])('transforms "%s" to "%s"', (property, expected) => {
    expect(kebabCase(property)).toBe(expected);
  });

  it.each([
    ['webkitTransition', '-webkit-transition'],
    ['webkitUserSelect', '-webkit-user-select'],
    ['webkitTransform', '-webkit-transform'],
    ['mozUserSelect', '-moz-user-select'],
    ['mozBorderRadius', '-moz-border-radius'],
    ['msTransform', '-ms-transform'],
    ['msUserSelect', '-ms-user-select'],
    ['msHyphens', '-ms-hyphens'],
    ['oTransition', '-o-transition'],
    ['khtmlTransition', '-khtml-transition'],
  ])('transforms vendor prefix "%s" to "%s"', (property, expected) => {
    expect(kebabCase(property)).toBe(expected);
  });

  it.each([
    ['WebkitTransition', '-webkit-transition'],
    ['WebkitUserSelect', '-webkit-user-select'],
    ['MozUserSelect', '-moz-user-select'],
    ['OTransition', '-o-transition'],
    ['KhtmlTransition', '-khtml-transition'],
  ])(
    'transforms capitalized vendor prefix "%s" to "%s"',
    (property, expected) => {
      expect(kebabCase(property)).toBe(expected);
    }
  );
});
