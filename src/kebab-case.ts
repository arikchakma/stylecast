const UPPERCASE_REGEX = /[A-Z]/g;
const VARIABLE_PROPERTY_REGEX = /^--[a-zA-Z0-9_-]+$/;
const CAMEL_VENDOR_PREFIX_REGEX = /^(webkit|moz|ms|o|khtml)[A-Z]/;

export function kebabCase(property: string) {
  if (!property || VARIABLE_PROPERTY_REGEX.test(property)) {
    return property;
  }

  let result = property;

  if (CAMEL_VENDOR_PREFIX_REGEX.test(property)) {
    result = result.replace(
      /^(webkit|moz|ms|o|khtml)/,
      (prefix) => `-${prefix}`
    );
  }

  result = result.replace(
    UPPERCASE_REGEX,
    (letter) => `-${letter.toLowerCase()}`
  );

  return result;
}
