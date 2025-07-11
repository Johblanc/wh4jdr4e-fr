import Wf4jdr4eFrDataModel from "./base-model.mjs";

export default class Wf4jdr4eFrItemBase extends Wf4jdr4eFrDataModel {

  static defineSchema() {
    const fields = foundry.data.fields;
    const schema = {};

    schema.description = new fields.StringField({ required: true, blank: true });

    return schema;
  }

}