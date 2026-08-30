import { describe, expect, it } from 'vitest';

import { collapse, expand } from './shorthand';

describe('expand', () => {
  it('returns {} for an empty object', () => {
    expect(expand({})).toEqual({});
  });

  it.each([
    ['color', 'red'],
    ['font-size', '14px'],
    ['background-color', 'rgb(48, 6, 16)'],
    ['--brand', '#ff0000'],
  ])('leaves "%s" alone', (property, value) => {
    expect(expand({ [property]: value })).toEqual({ [property]: value });
  });

  it.each([
    [
      '0',
      {
        'margin-top': '0',
        'margin-right': '0',
        'margin-bottom': '0',
        'margin-left': '0',
      },
    ],
    [
      '0 auto',
      {
        'margin-top': '0',
        'margin-right': 'auto',
        'margin-bottom': '0',
        'margin-left': 'auto',
      },
    ],
    [
      '1px 2px 3px',
      {
        'margin-top': '1px',
        'margin-right': '2px',
        'margin-bottom': '3px',
        'margin-left': '2px',
      },
    ],
    [
      '1px 2px 3px 4px',
      {
        'margin-top': '1px',
        'margin-right': '2px',
        'margin-bottom': '3px',
        'margin-left': '4px',
      },
    ],
  ])('expands margin "%s"', (value, expected) => {
    expect(expand({ margin: value })).toEqual(expected);
  });

  it('expands padding the same way as margin', () => {
    expect(expand({ padding: '8px 40px' })).toEqual({
      'padding-top': '8px',
      'padding-right': '40px',
      'padding-bottom': '8px',
      'padding-left': '40px',
    });
  });

  it('collapses extra whitespace between components', () => {
    expect(expand({ margin: '  1px   2px  ' })).toEqual({
      'margin-top': '1px',
      'margin-right': '2px',
      'margin-bottom': '1px',
      'margin-left': '2px',
    });
  });

  it.each(['width', 'style', 'color'])(
    'expands border-%s over four sides',
    (part) => {
      expect(expand({ [`border-${part}`]: 'a b' })).toEqual({
        [`border-top-${part}`]: 'a',
        [`border-right-${part}`]: 'b',
        [`border-bottom-${part}`]: 'a',
        [`border-left-${part}`]: 'b',
      });
    }
  );

  it('expands border-radius into corners', () => {
    expect(expand({ 'border-radius': '4px 8px' })).toEqual({
      'border-top-left-radius': '4px',
      'border-top-right-radius': '8px',
      'border-bottom-right-radius': '4px',
      'border-bottom-left-radius': '8px',
    });
  });

  it('leaves an elliptical border-radius alone', () => {
    const style = { 'border-radius': '10px / 20px' };
    expect(expand(style)).toEqual(style);
  });

  it('expands border into every side and part', () => {
    expect(expand({ border: '2px solid #e2e2e2' })).toEqual({
      'border-top-width': '2px',
      'border-right-width': '2px',
      'border-bottom-width': '2px',
      'border-left-width': '2px',
      'border-top-style': 'solid',
      'border-right-style': 'solid',
      'border-bottom-style': 'solid',
      'border-left-style': 'solid',
      'border-top-color': '#e2e2e2',
      'border-right-color': '#e2e2e2',
      'border-bottom-color': '#e2e2e2',
      'border-left-color': '#e2e2e2',
    });
  });

  it.each([
    ['solid', { width: 'medium', style: 'solid', color: 'currentcolor' }],
    ['1px', { width: '1px', style: 'none', color: 'currentcolor' }],
    ['red', { width: 'medium', style: 'none', color: 'red' }],
    ['solid red', { width: 'medium', style: 'solid', color: 'red' }],
  ])('fills the parts border "%s" leaves out', (value, parts) => {
    expect(expand({ 'border-top': value })).toEqual({
      'border-top-width': parts.width,
      'border-top-style': parts.style,
      'border-top-color': parts.color,
    });
  });

  it.each([
    ['SOLID', 'style'],
    ['Thin', 'width'],
    ['MEDIUM', 'width'],
  ])('classifies the keyword "%s" as a %s', (value, part) => {
    expect(expand({ 'border-top': value })[`border-top-${part}`]).toBe(value);
  });

  it.each([
    ['calc(1px + 2px)', 'width'],
    ['rgb(48, 6, 16)', 'color'],
    ['var(--brand)', 'color'],
  ])('reads the function value "%s" as a %s', (value, part) => {
    expect(expand({ 'border-top': value })[`border-top-${part}`]).toBe(value);
  });

  it('accepts camel case properties', () => {
    expect(expand({ borderRadius: '4px' })).toEqual({
      'border-top-left-radius': '4px',
      'border-top-right-radius': '4px',
      'border-bottom-right-radius': '4px',
      'border-bottom-left-radius': '4px',
    });
  });

  it('returns camel case properties when asked', () => {
    expect(expand({ margin: '0 auto' }, { camelCase: true })).toEqual({
      marginTop: '0',
      marginRight: 'auto',
      marginBottom: '0',
      marginLeft: 'auto',
    });
  });

  it('lets a longhand win over a shorthand once both are expanded', () => {
    const theme = expand({ padding: '8px' });
    const authored = expand({ 'padding-left': '40px' });

    expect({ ...theme, ...authored }).toEqual({
      'padding-top': '8px',
      'padding-right': '8px',
      'padding-bottom': '8px',
      'padding-left': '40px',
    });
  });
});

describe('collapse', () => {
  it('returns {} for an empty object', () => {
    expect(collapse({})).toEqual({});
  });

  it.each([
    [['1px', '1px', '1px', '1px'], '1px'],
    [['1px', '2px', '1px', '2px'], '1px 2px'],
    [['1px', '2px', '3px', '2px'], '1px 2px 3px'],
    [['1px', '2px', '3px', '4px'], '1px 2px 3px 4px'],
  ])('writes margin %s as "%s"', (values, expected) => {
    const [top, right, bottom, left] = values;

    expect(
      collapse({
        'margin-top': top as string,
        'margin-right': right as string,
        'margin-bottom': bottom as string,
        'margin-left': left as string,
      })
    ).toEqual({ margin: expected });
  });

  it('leaves a group with a missing longhand alone', () => {
    const style = {
      'margin-top': '1px',
      'margin-right': '2px',
      'margin-bottom': '3px',
    };

    expect(collapse(style)).toEqual(style);
  });

  it('writes the border parts as a single border', () => {
    expect(collapse(expand({ border: '2px solid #e2e2e2' }))).toEqual({
      border: '2px solid #e2e2e2',
    });
  });

  it('keeps the border parts apart when a side differs', () => {
    const style = expand({ border: '2px solid #e2e2e2' });
    style['border-top-width'] = '1px';

    expect(collapse(style)).toEqual({
      'border-width': '1px 2px 2px',
      'border-style': 'solid',
      'border-color': '#e2e2e2',
    });
  });

  it('keeps the shorthand where its first longhand was', () => {
    expect(
      collapse({
        color: 'red',
        'margin-top': '0',
        'font-size': '14px',
        'margin-right': '0',
        'margin-bottom': '0',
        'margin-left': '0',
      })
    ).toEqual({ color: 'red', margin: '0', 'font-size': '14px' });
  });

  it('returns camel case properties when asked', () => {
    expect(collapse(expand({ padding: '8px' }), { camelCase: true })).toEqual({
      padding: '8px',
    });
  });

  it.each<Record<string, string>>([
    { margin: '0 auto' },
    { padding: '1px 2px 3px 4px' },
    { 'border-radius': '4px 8px' },
    { border: '2px solid red' },
    { 'border-width': '1px 2px' },
  ])('round trips %o', (style) => {
    expect(collapse(expand(style))).toEqual(style);
  });
});

describe('expand priorities and wide keywords', () => {
  it('carries !important onto every longhand', () => {
    expect(expand({ margin: '0 auto !important' })).toEqual({
      'margin-top': '0 !important',
      'margin-right': 'auto !important',
      'margin-bottom': '0 !important',
      'margin-left': 'auto !important',
    });
  });

  it('carries !important onto every border part', () => {
    expect(expand({ 'border-top': '1px solid red !important' })).toEqual({
      'border-top-width': '1px !important',
      'border-top-style': 'solid !important',
      'border-top-color': 'red !important',
    });
  });

  it.each(['inherit', 'initial', 'unset', 'revert'])(
    'gives every border part the wide keyword "%s"',
    (keyword) => {
      expect(expand({ 'border-top': keyword })).toEqual({
        'border-top-width': keyword,
        'border-top-style': keyword,
        'border-top-color': keyword,
      });
    }
  );

  it('gives every edge the wide keyword', () => {
    expect(expand({ padding: 'inherit' })).toEqual({
      'padding-top': 'inherit',
      'padding-right': 'inherit',
      'padding-bottom': 'inherit',
      'padding-left': 'inherit',
    });
  });

  it.each(['margin', 'border', 'border-top', 'border-radius'])(
    'leaves an empty "%s" alone',
    (property) => {
      expect(expand({ [property]: '' })).toEqual({ [property]: '' });
    }
  );
});
