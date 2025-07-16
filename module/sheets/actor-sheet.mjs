import {
  onManageActiveEffect,
  prepareActiveEffectCategories,
} from '../helpers/effects.mjs';

/**
 * Extend the ApplicationV2 framework for actor sheets
 * @extends {foundry.applications.api.ApplicationV2}
 */
export class Wfjdr4eActorSheet extends foundry.applications.api.ApplicationV2 {
  constructor(options = {}) {
    super(options);
    this.#actor = options.document;
  }

  #actor;

  /** @override */
  static DEFAULT_OPTIONS = {
    tag: "form",
    classes: ['wh4jdr4e-fr', 'sheet', 'actor'],
    position: {
      width: 600,
      height: 600
    },
    window: {
      resizable: true
    }
  };

  /** @override */
  static PARTS = {
    form: {
      template: "systems/wh4jdr4e-fr/templates/actor/actor-character-sheet.hbs"
    }
  };

  /** @override */
  get title() {
    return `${this.actor.name} - ${game.i18n.localize("WFJDR4E.SheetLabels.Actor")}`;
  }

  /** @override */
  get actor() {
    return this.#actor;
  }

  /** @override */
  get document() {
    return this.#actor;
  }

  /** @override */
  get isEditable() {
    return this.actor.isOwner;
  }

  /** @override */
  async _prepareContext(options) {
    // Use a safe clone of the actor data for further operations.
    const actorData = this.actor.toPlainObject();

    const context = {
      actor: this.actor,
      system: actorData.system,
      flags: actorData.flags,
      config: CONFIG.WFJDR4E,
      isEditable: this.isEditable,
      cssClass: this.options.classes?.join(' ') || '',
      items: this.actor.items
    };

    // Prepare character data and items.
    if (actorData.type == 'character') {
      this._prepareItems(context);
      this._prepareCharacterData(context);
    }

    // Prepare NPC data and items.
    if (actorData.type == 'npc') {
      this._prepareItems(context);
    }

    // Enrich biography info for display
    context.enrichedBiography = await foundry.applications.ux.TextEditor.implementation.enrichHTML(
      this.actor.system.biography,
      {
        secrets: this.actor.isOwner,
        async: true,
        rollData: this.actor.getRollData(),
        relativeTo: this.actor,
      }
    );

    // Prepare active effects
    context.effects = prepareActiveEffectCategories(
      // A generator that returns all effects stored on the actor
      // as well as any items
      this.actor.allApplicableEffects()
    );

    return context;
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
    // Update the actor with form data
    if (!this.actor) return;
    await this.actor.update(formData);
  }

  /**
   * Handle item edit clicks
   */
  _onItemEdit(event) {
    if (!event.target.matches('.item-edit')) return;
    event.preventDefault();

    const li = event.target.closest('.item');
    if (!li) return;

    const item = this.actor.items.get(li.dataset.itemId);
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

    const item = this.actor.items.get(li.dataset.itemId);
    if (item) item.delete();
  }

  /**
   * Handle effect control clicks
   */
  _onEffectControl(event) {
    if (!event.target.matches('.effect-control')) return;
    event.preventDefault();

    const row = event.target.closest('li');
    const parent = row.dataset.parentId === this.actor.id
      ? this.actor
      : this.actor.items.get(row.dataset.parentId);

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
    const data = foundry.utils.duplicate(header.dataset);
    const name = `New ${type.capitalize()}`;

    const itemData = {
      name: name,
      type: type,
      system: data,
    };

    delete itemData.system['type'];

    return foundry.documents.BaseItem.create(itemData, { parent: this.actor });
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
      const item = this.actor.items.get(itemId);
      if (item) return item.roll();
    }

    // Handle rolls that supply the formula directly
    if (dataset.roll) {
      let label = dataset.label ? `[ability] ${dataset.label}` : '';
      let roll = new foundry.dice.Roll(dataset.roll, this.actor.getRollData());
      roll.toMessage({
        speaker: foundry.documents.BaseChatMessage.getSpeaker({ actor: this.actor }),
        flavor: label,
        rollMode: game.settings.get('core', 'rollMode'),
      });
      return roll;
    }
  }

  /**
   * Factory method to create actor sheets
   * @param {Actor} actor - The actor document
   * @returns {Wfjdr4eActorSheet}
   */
  static create(actor) {
    return new this({ document: actor });
  }
}
