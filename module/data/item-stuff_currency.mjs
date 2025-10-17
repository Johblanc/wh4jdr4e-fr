import Wfjdr4eItemBase from "./base-item.mjs";

export default class Wfjdr4eStuffCurrency extends Wfjdr4eItemBase {
  static defineSchema() {
    const fields = foundry.data.fields;
    const schema = super.defineSchema();

    schema.name = new fields.StringField({ required: true, blank: true });
    schema.shortcut = new fields.StringField({ required: true, blank: true });
    schema.origin = new fields.StringField({ required: true, blank: true });
    schema.description = new fields.StringField({ required: true, blank: true });
    schema.value = new fields.NumberField({ required: true, min: 0 });
    schema.weight = new fields.NumberField({ required: true, min: 0 });

    return schema;
  }
}