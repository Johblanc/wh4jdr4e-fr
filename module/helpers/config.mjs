export const WFJDR4E = {};

/**
 * The set of Ability Scores used within the system.
 * @type {Object}
 */
WFJDR4E.abilities = {
  ws: 'WFJDR4E.Ability.WS.long',
  bs: 'WFJDR4E.Ability.BS.long',
  s: 'WFJDR4E.Ability.S.long',
  t: 'WFJDR4E.Ability.T.long',
  i: 'WFJDR4E.Ability.I.long',
  ag: 'WFJDR4E.Ability.Ag.long',
  dex: 'WFJDR4E.Ability.Dex.long',
  int: 'WFJDR4E.Ability.Int.long',
  wp: 'WFJDR4E.Ability.WP.long',
  fel: 'WFJDR4E.Ability.Fel.long',
};

WFJDR4E.abilityAbbreviations = {
  ws: 'WFJDR4E.Ability.WS.abbr',
  bs: 'WFJDR4E.Ability.BS.abbr',
  s: 'WFJDR4E.Ability.S.abbr',
  t: 'WFJDR4E.Ability.T.abbr',
  i: 'WFJDR4E.Ability.I.abbr',
  ag: 'WFJDR4E.Ability.Ag.abbr',
  dex: 'WFJDR4E.Ability.Dex.abbr',
  int: 'WFJDR4E.Ability.Int.abbr',
  wp: 'WFJDR4E.Ability.WP.abbr',
  fel: 'WFJDR4E.Ability.Fel.abbr',
};

WFJDR4E.abilityDescriptions = {
  ws: 'WFJDR4E.Ability.WS.description',
  bs: 'WFJDR4E.Ability.BS.description',
  s: 'WFJDR4E.Ability.S.description',
  t: 'WFJDR4E.Ability.T.description',
  i: 'WFJDR4E.Ability.I.description',
  ag: 'WFJDR4E.Ability.Ag.description',
  dex: 'WFJDR4E.Ability.Dex.description',
  int: 'WFJDR4E.Ability.Int.description',
  wp: 'WFJDR4E.Ability.WP.description',
  fel: 'WFJDR4E.Ability.Fel.description',
};

WFJDR4E.stuffFeatureCategory = {
  Bonus: 'WFJDR4E.StuffFeatureCategory.Bonus',
  Group: 'WFJDR4E.StuffFeatureCategory.Group',
  Malus: 'WFJDR4E.StuffFeatureCategory.Malus',
};

WFJDR4E.stuffFeatureDivision = {
  Weapon: 'WFJDR4E.StuffFeatureDivision.Weapon',
  Melee_Weapon: 'WFJDR4E.StuffFeatureDivision.Melee_Weapon',
  Ballistic_Weapon: 'WFJDR4E.StuffFeatureDivision.Ballistic_Weapon',
  Armor: 'WFJDR4E.StuffFeatureDivision.Armor',
  Consumable: 'WFJDR4E.StuffFeatureDivision.Consumable',
  Container: 'WFJDR4E.StuffFeatureDivision.Container',
  Objet: 'WFJDR4E.StuffFeatureDivision.Objet',
  Service: 'WFJDR4E.StuffFeatureDivision.Service',
};

WFJDR4E.keys = {
  Actor: {
    character: {},
    npc: {},
  },
  Item: {
    item: {},
    feature: {},
    spell: {},
    stuff_feature: {
      name: 'WFJDR4E.StuffFeature.name',
      description: 'WFJDR4E.StuffFeature.description',
      has_indice: 'WFJDR4E.StuffFeature.has_indice',
      category: 'WFJDR4E.StuffFeature.category',
      division: 'WFJDR4E.StuffFeature.division'
    }
  }
}


WFJDR4E.types = {
  Actor: {
    character: 'TYPES.Actor.character',
    npc: 'TYPES.Actor.npc'
  },
  Item: {
    item: 'TYPES.Item.item',
    feature: 'TYPES.Item.feature',
    spell: 'TYPES.Item.spell',
    stuff_feature: 'TYPES.Item.stuff_feature'
  }
};

