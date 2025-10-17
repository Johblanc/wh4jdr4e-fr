import Wfjdr4eItemBase from "./base-item.mjs";

export default class Wfjdr4eStuffFeature extends Wfjdr4eItemBase {
  static defineSchema() {
    const fields = foundry.data.fields;
    const schema = super.defineSchema();

    schema.name = new fields.StringField({ required: true, blank: true });
    schema.description = new fields.StringField({ required: true, blank: true });
    // Add specific fields for StuffFeature
    schema.has_indice = new fields.BooleanField({ required: true, initial: false });
    schema.category = new fields.StringField({
      required: true,
      initial: "Bonus",
      choices: Object.keys(CONFIG.WFJDR4E.stuffFeatureCategory)
    });
    schema.division = new fields.StringField({
      required: true,
      initial: "Weapon",
      choices: Object.keys(CONFIG.WFJDR4E.stuffFeatureDivision)
    });

    return schema;
  }
}