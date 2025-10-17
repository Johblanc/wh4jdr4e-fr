import {
  onManageActiveEffect,
  prepareActiveEffectCategories,
} from '../helpers/effects.mjs';

/**
 * Extend the ApplicationV2 framework for actor sheets
 * @extends {foundry.applications.sheets.ActorSheetV2}
 */
export class Wfjdr4eActorSheet extends foundry.applications.sheets.ActorSheetV2 {
  /** @override */
  static DEFAULT_OPTIONS = {
    classes: ['wh4jdr4e-fr', 'sheet', 'actor'],
    position: {
      width: 600,
      height: 600
    },
    window: {
      resizable: true
    },
    form: {
      submitOnChange: false,
      closeOnSubmit: false
    }
  };

  /** @override */
  static PARTS = {
    header: {
      template: "systems/wh4jdr4e-fr/templates/actor/parts/actor-header.hbs"
    },
    tabs: {
      template: "templates/generic/tab-navigation.hbs"
    },
    attributes: {
      template: "systems/wh4jdr4e-fr/templates/actor/parts/actor-attributes.hbs"
    },
    inventory: {
      template: "systems/wh4jdr4e-fr/templates/actor/parts/actor-inventory.hbs",
      scrollable: [""]
    },
    features: {
      template: "systems/wh4jdr4e-fr/templates/actor/parts/actor-features.hbs"
    },
    spells: {
      template: "systems/wh4jdr4e-fr/templates/actor/parts/actor-spells.hbs"
    },
    biography: {
      template: "systems/wh4jdr4e-fr/templates/actor/parts/actor-biography.hbs"
    },
    effects: {
      template: "systems/wh4jdr4e-fr/templates/actor/parts/actor-effects.hbs"
    }
  };

  /** @override */
  get template() {
    return `systems/wh4jdr4e-fr/templates/actor/actor-${this.document.type}-sheet.hbs`;
  }

  /** @override */
  get title() {
    return `${this.document.name} - ${game.i18n.localize("WFJDR4E.SheetLabels.Actor")}`;
  }

  /** @override */
  async _prepareContext(options) {
    const context = await super._prepareContext(options);

    // Use a safe clone of the actor data for further operations.
    const actorData = this.document.toPlainObject();

    const mergedContext = foundry.utils.mergeObject(context, {
      actor: this.document, // Maintain compatibility with existing templates
      system: actorData.system,
      flags: actorData.flags,
      config: CONFIG.WFJDR4E,
      items: this.document.items,
      tabs: this._getTabs()
    });

    // Prepare character data and items.
    if (actorData.type == 'character') {
      this._prepareItems(mergedContext);
      this._prepareCharacterData(mergedContext);
    }

    // Prepare NPC data and items.
    if (actorData.type == 'npc') {
      this._prepareItems(mergedContext);
    }

    // Enrich biography info for display
    mergedContext.enrichedBiography = await foundry.applications.ux.TextEditor.implementation.enrichHTML(
      this.document.system.biography,
      {
        secrets: this.document.isOwner,
        async: true,
        rollData: this.document.getRollData(),
        relativeTo: this.document,
      }
    );

    // Prepare active effects
    mergedContext.effects = prepareActiveEffectCategories(
      // A generator that returns all effects stored on the actor
      // as well as any items
      this.document.allApplicableEffects()
    );

    return mergedContext;
  }

  /**
   * Prepare tabs for the sheet
   */
  _getTabs() {
    const tabs = {
      attributes: { id: "attributes", group: "primary", label: "WFJDR4E.Attributes" },
      inventory: { id: "inventory", group: "primary", label: "WFJDR4E.Inventory" },
      features: { id: "features", group: "primary", label: "WFJDR4E.Features" },
      biography: { id: "biography", group: "primary", label: "WFJDR4E.Biography" }
    };

    if (this.document.type === 'character') {
      tabs.spells = { id: "spells", group: "primary", label: "WFJDR4E.Spells" };
    }

    if (this.document.effects.size > 0 || this.document.items.some(i => i.effects.size > 0)) {
      tabs.effects = { id: "effects", group: "primary", label: "WFJDR4E.Effects" };
    }

    return tabs;
  }

  /**
   * Character-specific context modifications
   *
   * @param {object} context The context object to mutate
   */
  _prepareCharacterData(context) {
    // This is where you can enrich character-specific editor fields
    // or setup anything else that's specific to this type
  }

  /**
   * Organize and classify Items for Actor sheets.
   *
   * @param {object} context The context object to mutate
   */
  _prepareItems(context) {
    // Initialize containers.
    const gear = [];
    const features = [];
    const spells = {
      0: [],
      1: [],
      2: [],
      3: [],
      4: [],
      5: [],
      6: [],
      7: [],
      8: [],
      9: [],
    };

    // Iterate through items, allocating to containers
    for (let i of context.items) {
      i.img = i.img || foundry.documents.BaseItem.DEFAULT_ICON;
      // Append to gear.
      if (i.type === 'item') {
        gear.push(i);
      }
      // Append to features.
      else if (i.type === 'feature') {
        features.push(i);
      }
      // Append to spells.
      else if (i.type === 'spell') {
        if (i.system.spellLevel != undefined) {
          spells[i.system.spellLevel].push(i);
        }
      }
    }

    // Assign and return
    context.gear = gear;
    context.features = features;
    context.spells = spells;
  }

  /* -------------------------------------------- */

  /** @override */
  _onRender(context, options) {
    super._onRender(context, options);

    // Add event listeners
    this.element.addEventListener('click', this._onItemEdit.bind(this));
    this.element.addEventListener('click', this._onItemCreate.bind(this));
    this.element.addEventListener('click', this._onItemDelete.bind(this));
    this.element.addEventListener('click', this._onEffectControl.bind(this));
    this.element.addEventListener('click', this._onRoll.bind(this));
  }

  /** @override */
  async _updateObject(event, formData) {
    // Ensure the name field is preserved if not explicitly set
    if (!formData.name && this.document.name) {
      formData.name = this.document.name;
    }

    // Update the actor with form data
    if (!this.document) return;
    await this.document.update(formData);
  }

  /** @override */
  _onChangeForm(formConfig, event) {
    // Override to ensure proper data handling
    const target = event.target;

    // Skip processing if the target doesn't have a name attribute
    if (!target.name) return;

    // Call the parent method to handle the change
    super._onChangeForm(formConfig, event);
  }

  /**
   * Handle item edit clicks
   */
  _onItemEdit(event) {
    if (!event.target.matches('.item-edit')) return;
    event.preventDefault();

    const li = event.target.closest('.item');
    if (!li) return;

    const item = this.document.items.get(li.dataset.itemId);
    if (item) item.sheet.render(true);
  }
  /**
   * Handle item delete clicks
   */
  _onItemDelete(event) {
    if (!event.target.matches('.item-delete')) return;
    if (!this.isEditable) return;
    event.preventDefault();

    const li = event.target.closest('.item');
    if (!li) return;

    const item = this.document.items.get(li.dataset.itemId);
    if (item) item.delete();
  }

  /**
   * Handle effect control clicks
   */
  _onEffectControl(event) {
    if (!event.target.matches('.effect-control')) return;
    event.preventDefault();

    const row = event.target.closest('li');
    const parent = row.dataset.parentId === this.document.id
      ? this.document
      : this.document.items.get(row.dataset.parentId);

    onManageActiveEffect(event, parent);
  }
  /**
   * Handle item creation clicks
   */
  _onItemCreate(event) {
    if (!event.target.matches('.item-create')) return;
    if (!this.isEditable) return;
    event.preventDefault();

    const header = event.target;
    const type = header.dataset.type;

    // Initialize a default name.
    const name = `New ${type.capitalize()}`;

    // Prepare the item object.
    const itemData = {
      name: name,
      type: type,
      system: {}
    };

    // Finally, create the item!
    return this.document.createEmbeddedDocuments('Item', [itemData]);
  }

  /**
   * Handle rollable clicks
   */
  _onRoll(event) {
    if (!event.target.matches('.rollable')) return;
    event.preventDefault();
    const element = event.target;
    const dataset = element.dataset;

    // Handle item rolls
    if (dataset.rollType === 'item') {
      const itemId = element.closest('.item').dataset.itemId;
      const item = this.document.items.get(itemId);
      if (item) return item.roll();
    }

    // Handle rolls that supply the formula directly
    if (dataset.roll) {
      let label = dataset.label ? `[ability] ${dataset.label}` : '';
      let roll = new foundry.dice.Roll(dataset.roll, this.document.getRollData());
      roll.toMessage({
        speaker: foundry.documents.BaseChatMessage.getSpeaker({ actor: this.document }),
        flavor: label,
        rollMode: game.settings.get('core', 'rollMode'),
      });
      return roll;
    }
  }

  /** @override */
  async _renderHTML(context, options) {
    // Use the template specified in the get template() method
    const template = this.template;
    return foundry.applications.handlebars.renderTemplate(template, context);
  }

  /** @override */
  _replaceHTML(result, content, options) {
    // Standard replacement - this is the default behavior
    content.innerHTML = result;
    return content;
  }
}
