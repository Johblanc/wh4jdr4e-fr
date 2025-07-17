// Import document classes.
import { Wfjdr4eActor } from './documents/actor.mjs';
import { Wfjdr4eItem } from './documents/item.mjs';
// Import sheet classes.
import { Wfjdr4eActorSheet } from './sheets/actor-sheet.mjs';
import { Wfjdr4eItemSheet } from './sheets/item-sheet.mjs';
// Import helper/utility classes and constants.
import { preloadHandlebarsTemplates } from './helpers/templates.mjs';
import { WFJDR4E } from './helpers/config.mjs';
// Import DataModel classes
import * as models from './data/_module.mjs';

/* -------------------------------------------- */
/*  Init Hook                                   */
/* -------------------------------------------- */

Hooks.once('init', function () {
  // Add utility classes to the global game object so that they're more easily
  // accessible in global contexts.
  game.wh4jdr4efr = {
    Wfjdr4eActor,
    Wfjdr4eItem,
    rollItemMacro,
  };

  // Add custom constants for configuration.
  CONFIG.WFJDR4E = WFJDR4E;

  /**
   * Set an initiative formula for the system
   * @type {String}
   */
  CONFIG.Combat.initiative = {
    formula: '1d20 + @abilities.dex.mod',
    decimals: 2,
  };

  // Define custom Document and DataModel classes
  CONFIG.Actor.documentClass = Wfjdr4eActor;

  // Note that you don't need to declare a DataModel
  // for the base actor/item classes - they are included
  // with the Character/NPC as part of super.defineSchema()
  CONFIG.Actor.dataModels = {
    character: models.Wfjdr4eCharacter,
    npc: models.Wfjdr4eNPC
  }
  CONFIG.Item.documentClass = Wfjdr4eItem;
  CONFIG.Item.dataModels = {
    item: models.Wfjdr4eItem,
    feature: models.Wfjdr4eFeature,
    spell: models.Wfjdr4eSpell,
    stuff_feature: models.Wfjdr4eStuffFeature
  }

  // Active Effects are never copied to the Actor,
  // but will still apply to the Actor from within the Item
  // if the transfer property on the Active Effect is true.
  CONFIG.ActiveEffect.legacyTransferral = false;

  // Register sheet application classes
  foundry.documents.collections.Actors.unregisterSheet('core', foundry.applications.sheets.ActorSheetV2);
  foundry.documents.collections.Actors.registerSheet('wh4jdr4e-fr', Wfjdr4eActorSheet, {
    makeDefault: true,
    label: 'WFJDR4E.SheetLabels.Actor',
  });
  foundry.documents.collections.Items.unregisterSheet('core', foundry.applications.sheets.ItemSheetV2);
  foundry.documents.collections.Items.registerSheet('wh4jdr4e-fr', Wfjdr4eItemSheet, {
    makeDefault: true,
    label: 'WFJDR4E.SheetLabels.Item',
  });

  // Preload Handlebars templates.
  return preloadHandlebarsTemplates();
});

/* -------------------------------------------- */
/*  Handlebars Helpers                          */
/* -------------------------------------------- */

// If you need to add Handlebars helpers, here is a useful example:
Handlebars.registerHelper('toLowerCase', function (str) {
  return str.toLowerCase();
});

/* -------------------------------------------- */
/*  Ready Hook                                  */
/* -------------------------------------------- */

Hooks.once('ready', function () {
  // Wait to register hotbar drop hook on ready so that modules could register earlier if they want to
  Hooks.on('hotbarDrop', (bar, data, slot) => createItemMacro(data, slot));
});

/* -------------------------------------------- */
/*  Hotbar Macros                               */
/* -------------------------------------------- */

/**
 * Create a Macro from an Item drop.
 * Get an existing item macro if one exists, otherwise create a new one.
 * @param {Object} data     The dropped data
 * @param {number} slot     The hotbar slot to use
 * @returns {Promise}
 */
async function createItemMacro(data, slot) {
  // First, determine if this is a valid owned item.
  if (data.type !== 'Item') return;
  if (!data.uuid.includes('Actor.') && !data.uuid.includes('Token.')) {
    return ui.notifications.warn(
      'You can only create macro buttons for owned Items'
    );
  }
  // If it is, retrieve it based on the uuid.
  const item = await foundry.documents.BaseItem.fromDropData(data);

  // Create the macro command using the uuid.
  const command = `game.wh4jdr4efr.rollItemMacro("${data.uuid}");`;
  let macro = game.macros.find(
    (m) => m.name === item.name && m.command === command
  );
  if (!macro) {
    macro = await foundry.documents.BaseMacro.create({
      name: item.name,
      type: 'script',
      img: item.img,
      command: command,
      flags: { 'wh4jdr4e-fr.itemMacro': true },
    });
  }
  game.user.assignHotbarMacro(macro, slot);
  return false;
}

/**
 * Create a Macro from an Item drop.
 * Get an existing item macro if one exists, otherwise create a new one.
 * @param {string} itemUuid
 */
function rollItemMacro(itemUuid) {
  // Reconstruct the drop data so that we can load the item.
  const dropData = {
    type: 'Item',
    uuid: itemUuid,
  };
  // Load the item from the uuid.
  foundry.documents.BaseItem.fromDropData(dropData).then((item) => {
    // Determine if the item loaded and if it's an owned item.
    if (!item || !item.parent) {
      const itemName = item?.name ?? itemUuid;
      return ui.notifications.warn(
        `Could not find item ${itemName}. You may need to delete and recreate this macro.`
      );
    }

    // Trigger the item roll
    item.roll();
  });
}
