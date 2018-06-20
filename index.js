"use strict";
const awssdk = require("aws-sdk");
const https = require("https");
const Schema = require("./lib/Schema");
const Model = require("./lib/Model");

class DynoMongo {
  constructor() {
    this.blueprints = {};
    this.endpointURL = null
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
    if (this.blueprints[name]) {
      let bindedModel = Model.bind(null,name,this.blueprints);
      bindedModel.get = Model.get.bind(this.blueprints[name].table);
      bindedModel.query = Model.query.bind(this.blueprints[name].table);
      return bindedModel
    }
    if (!(schema instanceof Schema)) {
      schema = new Schema(schema, options);
    }
    let getTableRef = Model.compile(name, schema, this, options);
    this.blueprints[name] = {};
    this.blueprints[name].table = getTableRef;
    // this.blueprints[name].oldModel = [];
    // this.blueprints[name].newModel = [];
    return getTableRef;
  }
  // static AWS() {
  //   return awssdk
  // }
  local(url) {
    this.endpointURL = url || "http://localhost:8000";
    this.ddb = new this.AWS.DynamoDB({
      endpoint: new this.AWS.Endpoint(this.endpointURL)
    })
  }
}
module.exports = new DynoMongo;