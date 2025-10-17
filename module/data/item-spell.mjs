import Wfjdr4eItemBase from "./base-item.mjs";

export default class Wfjdr4eSpell extends Wfjdr4eItemBase {

  static defineSchema() {
    const fields = foundry.data.fields;
    const schema = super.defineSchema();

    schema.name = new fields.StringField({ required: true, blank: true });
    schema.description = new fields.StringField({ required: true, blank: true });
    schema.spellLevel = new fields.NumberField({ required: true, nullable: false, integer: true, initial: 1, min: 1, max: 9 });

    return schema;
  }
}