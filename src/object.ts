import type { Declaration } from './ast';
import type { CamelCaseOptions } from './camel-case';
import { camelCase } from './camel-case';
import { declarations } from './parser';

export type ObjectifyOptions = {
  camelCase: boolean;
} & CamelCaseOptions;

export function objectify(
  input: Declaration[] | string,
  options: Partial<ObjectifyOptions> = {}
) {
  options.camelCase ??= false;
  options.reactify ??= false;
  if (options.reactify) {
    options.camelCase = true;
  }

  const styles = typeof input === 'string' ? declarations(input) : input;
  const object: Record<string, string> = {};
  for (const declaration of styles) {
    if (options.camelCase) {
      object[camelCase(declaration.property, options)] = declaration.value;
    } else {
      object[declaration.property] = declaration.value;
    }
  }

  return object;
}
