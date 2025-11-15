const HYPHEN_REGEX = /-([a-z])/g;
const VARIABLE_PROPERTY_REGEX = /^--[a-zA-Z0-9_-]+$/;
const VENDOR_PREFIX_REGEX = /^-(webkit|moz|ms|o|khtml)-/;
const MS_VENDOR_PREFIX_REGEX = /^-(ms)-/;

function isMsVendorPrefix(property: string) {
  return MS_VENDOR_PREFIX_REGEX.test(property);
}

function skip(property: string) {
  return (
    !property ||
    !property.includes('-') ||
    VARIABLE_PROPERTY_REGEX.test(property)
  );
}

function hyphen(_: string, letter: string) {
  return letter + '-';
}

export type CamelCaseOptions = {
  reactify: boolean;
};

export function camelCase(
  property: string,
  options: Partial<CamelCaseOptions> = {}
) {
  options.reactify ??= false;
  if (skip(property)) {
    return property;
  }

  let result = property.toLowerCase();
  if (options.reactify) {
    if (isMsVendorPrefix(property)) {
      result = result.replace(MS_VENDOR_PREFIX_REGEX, hyphen);
    }
  } else {
    // for non React, remove the first hyphen
    // so that the vendor prefix is not capitalized
    result = result.replace(VENDOR_PREFIX_REGEX, hyphen);
  }

  return result.replace(HYPHEN_REGEX, (_, letter) => {
    return letter.toUpperCase();
  });
}
