/**
 * Define a set of template paths to pre-load
 * Pre-loaded templates are compiled and cached for fast access when rendering
 * @return {Promise}
 */
export const preloadHandlebarsTemplates = async function () {
  return loadTemplates([
    // Actor partials.
    'systems/wh4jdr4e-fr/templates/actor/parts/actor-features.hbs',
    'systems/wh4jdr4e-fr/templates/actor/parts/actor-items.hbs',
    'systems/wh4jdr4e-fr/templates/actor/parts/actor-spells.hbs',
    'systems/wh4jdr4e-fr/templates/actor/parts/actor-effects.hbs',
    // Item partials
    'systems/wh4jdr4e-fr/templates/item/parts/item-effects.hbs',
  ]);
};
