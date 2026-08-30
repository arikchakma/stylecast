import { bench, group, run, summary } from 'mitata';

import { objectify } from '../src/object';
import { collapse, expand } from '../src/shorthand';

// one shorthand, the cheapest thing either function can be handed
const tiny = { margin: '0 auto' };

// the shape a component style object usually has: a few shorthands mixed in
// with longhands that have to be carried through untouched
const component = objectify(
  'display: flex; flex-direction: column; align-items: center; justify-content: space-between; padding: 1rem 2rem; margin: 0 auto; background-color: #ffffff; border: 1px solid rgba(0,0,0,0.1); border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.05);'
);

// every shorthand this module knows about, all present at once
const shorthandHeavy = objectify(
  'margin: 1px 2px 3px 4px; padding: 5px; border: 2px dashed rebeccapurple; border-radius: 10px 5px; border-width: 1px 2px; border-style: solid dotted; border-color: red blue;'
);

// nothing to expand: the loop still visits every declaration and finds no work
const longhandOnly = expand(shorthandHeavy);

// what collapse is actually built to eat
const collapsible = expand(shorthandHeavy);

const cases = [
  ['tiny', tiny],
  ['component', component],
  ['shorthand-heavy', shorthandHeavy],
  ['longhand-only', longhandOnly],
] as const;

for (const [name, object] of cases) {
  summary(() => {
    group(
      `expand: ${name} (${Object.keys(object).length} declarations)`,
      () => {
        bench('kebab-case', () => {
          expand(object);
        });

        bench('camelCase', () => {
          expand(object, { camelCase: true });
        });
      }
    );
  });
}

summary(() => {
  group(
    `collapse: expanded (${Object.keys(collapsible).length} declarations)`,
    () => {
      bench('kebab-case', () => {
        collapse(collapsible);
      });

      bench('camelCase', () => {
        collapse(collapsible, { camelCase: true });
      });
    }
  );
});

summary(() => {
  group('collapse: nothing to collapse', () => {
    bench('component', () => {
      collapse(component);
    });

    bench('tiny', () => {
      collapse(tiny);
    });
  });
});

summary(() => {
  group('round trip vs. its parts', () => {
    bench('objectify', () => {
      objectify(
        'margin: 1px 2px 3px 4px; padding: 5px; border: 2px dashed rebeccapurple; border-radius: 10px 5px; border-width: 1px 2px; border-style: solid dotted; border-color: red blue;'
      );
    });

    bench('expand', () => {
      expand(shorthandHeavy);
    });

    bench('collapse', () => {
      collapse(collapsible);
    });

    bench('expand + collapse', () => {
      collapse(expand(shorthandHeavy));
    });
  });
});

await run();
