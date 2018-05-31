const awssdk = require("aws-sdk");
const https = require("https");
const Schema = require("./lib/Schema");
const Model = require("./lib/Model");

class DynoMongo {
  constructor() {
    this.blueprints = {};
    this.AWS = awssdk;
    this.ddb = new awssdk.DynamoDB(() => {
      if (this.endpointURL) {
        return {
          endpoint: new awssdk.Endpoint(this.endpointURL)
        }
      }
      else {
        return;
      }
    });
    this.Schema = Schema;
  }
  model(name, schema, options) {
    const bluePrint = this.blueprints[name]
    if (bluePrint) {
      return bluePrint["model"] ;
    }
    if (!(schema instanceof Schema)) {
      schema = new Schema(schema, options);
    }
    let blueprint = Model.compile(name, schema, options, this);
    this.blueprints[name] = blueprint;
    return blueprint.table;
  }
  // static AWS() {
  //   return awssdk
  // }
  local(url) {
    this.endpointURL = url || "http://localhost:8000";
  }
}
module.exports = new DynoMongo;