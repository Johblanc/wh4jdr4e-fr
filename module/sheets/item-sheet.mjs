import {
  onManageActiveEffect,
  prepareActiveEffectCategories,
} from '../helpers/effects.mjs';

/**
 * Extend the ApplicationV2 framework for item sheets
 * @extends {foundry.applications.api.ApplicationV2}
 */
export class Wfjdr4eItemSheet extends foundry.applications.api.ApplicationV2 {
  constructor(options = {}) {
    super(options);
    this.#item = options.document;
  }

  #item;

  /** @override */
  static DEFAULT_OPTIONS = {
    tag: "form",
    classes: ['wh4jdr4e-fr', 'sheet', 'item'],
    position: {
      width: 520,
      height: 480
    },
    window: {
      resizable: true
    }
  };

  /** @override */
  static PARTS = {
    form: {
      template: "systems/wh4jdr4e-fr/templates/item/item-sheet.hbs"
    }
  };

  /** @override */
  get title() {
    return `${this.item.name} - ${game.i18n.localize("WFJDR4E.SheetLabels.Item")}`;
  }

  /** @override */
  get item() {
    return this.#item;
  }

  /** @override */
  get document() {
    return this.#item;
  }

  /** @override */
  get isEditable() {
    return this.item.isOwner;
  }

  /** @override */
  async _prepareContext(options) {
    // Use a safe clone of the item data for further operations.
    const itemData = this.item.toPlainObject();

    // Enrich description info for display
    const enrichedDescription = await foundry.applications.ux.TextEditor.implementation.enrichHTML(
      this.item.system.description,
      {
        secrets: this.item.isOwner,
        async: true,
        rollData: this.item.getRollData(),
        relativeTo: this.item,
      }
    );

    // Prepare active effects for easier access
    const effects = prepareActiveEffectCategories(this.item.effects);

    const context = {
      item: this.item,
      system: itemData.system,
      flags: itemData.flags,
      enrichedDescription,
      effects,
      config: CONFIG.WFJDR4E,
      isEditable: this.isEditable,
      cssClass: this.options.classes?.join(' ') || ''
    };

    // Adding footer label and display keys
    context.config.footerLabel = game.i18n.localize(CONFIG.WFJDR4E.types.Item[this.item.type]);
    context.config.footerLabel += " : " + this.item.name;
    const keys = CONFIG.WFJDR4E.keys.Item[this.item.type];
    context.config.displaykeys = Object.entries(keys).reduce((acc, [key, value]) => {
      acc[key] = game.i18n.localize(value);
      return acc;
    }, {});

    return context;
  }

  /** @override */
  _onRender(context, options) {
    super._onRender(context, options);

    // Add event listeners for effects
    this.element.addEventListener('click', (event) => {
      if (event.target.matches('.effect-control')) {
        onManageActiveEffect(event, this.item);
      }
    });
  }

  /** @override */
  async _updateObject(event, formData) {
    // Update the item with form data
    if (!this.item) return;
    await this.item.update(formData);
  }

  /**
   * Factory method to create item sheets
   * @param {Item} item - The item document
   * @returns {Wfjdr4eItemSheet}
   */
  static create(item) {
    return new this({ document: item });
  }
}
