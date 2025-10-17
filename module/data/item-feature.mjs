import Wfjdr4eItemBase from "./base-item.mjs";

export default class Wfjdr4eFeature extends Wfjdr4eItemBase {

  static defineSchema() {
    const fields = foundry.data.fields;
    const schema = super.defineSchema();
    schema.name = new fields.StringField({ required: true, blank: true });
    schema.description = new fields.StringField({ required: true, blank: true });
    return schema;
  }
}