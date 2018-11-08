"use strict";
const dynoUtils = require("./DynoUtils");
const Table = require("./Table");

class Model {
  constructor(name, blueprints, schema) {
    // this.newSchema = dynoUtils.createDynamoTree(schema); //Problem is here.
    // schema = dynoUtils.createDynToJsonTree(schema);
    // Object.keys(schema).forEach((key) => {
    //   this[key] = schema[key];
    // });
    // this.prototype.table = blueprints[name].table.table;
    // this.prototype.ddb = blueprints[name].table.dynoMongo.ddb
    // for(var key in schema) {
    //   this[key] = schema[key];
    // }
    // this.blueprints[name].oldModel.push(schema);
  }
  
  static compile(name, schema, ddb, options) {
    let newTableSchema = new Table(name, schema, ddb, options);
    return newTableSchema;
  }
  static get(...args) {
    return Table.get.call(this,...args);
  }
  static query(...args) {
    return Table.query.call(this,...args);
  }
  static update(...args) {
    return Table.update.call(this,...args);
  }
  async save(callback) {
    let params = {
      TableName: this.table.name,
      Item: dynoUtils.createDynamoTree(this)
    };
    return await new Promise((resolve, reject) => { 
      this.ddb.putItem(params, (err, res) => {
        if (callback) {
          callback(err,this)
        }
        if (err) { reject(err); }
        resolve(this);
      });
    });
  }
  async deleteOne(keySchema, callback) {
    let params = {
      TableName: this.table.name,
      Key : dynoUtils.createDynamoTree(keySchema)
    }
    return new Promise((resolve, reject) => {
      this.ddb.deleteItem(params, (err, res) => {
        if (callback) {
          callback(err,res)
        }
        if (err) { reject(err); }
        resolve(res);
      });
    });
  }

}

module.exports = Model;