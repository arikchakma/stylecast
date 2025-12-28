import { kebabCase } from './kebab-case';

export type StringifyOptions = {
  kebabCase: boolean;
};

export function stringify(
  object: Record<string, string>,
  options: Partial<StringifyOptions> = {}
) {
  options.kebabCase ??= false;

  const declarations: string[] = [];
  for (const [property, value] of Object.entries(object)) {
    const key = options.kebabCase ? kebabCase(property) : property;
    declarations.push(`${key}: ${value};`);
  }

  return declarations.join(' ');
}
