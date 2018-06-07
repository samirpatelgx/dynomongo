const dynoUtils = require("./DynoUtils");
const Table = require("./Table");

class Model {
  constructor(name, blueprints, schema) {
    this.blueprints = blueprints;
    this.name = name;
    this.schema = schema;
    this.newSchema = dynoUtils.createDynamoTree(schema); //Problem is here.
    this.table = this.blueprints[name].table.table;
    this.dynoMongo = this.blueprints[name].table.dynoMongo
    // for(var key in schema) {
    //   this[key] = schema[key];
    // }
    // this.blueprints[name].oldModel.push(schema);
  }
  
  static compile(name, schema, dynoMongo, options) {
    let newTableSchema = new Table(name, schema, dynoMongo, options);
    return newTableSchema;
  }
  async save() {
    let params = {
      TableName: this.table.TableName,
      Item: this.newSchema
    };
    return await new Promise((resolve, reject) => { 
      this.dynoMongo.ddb.putItem(params, (err, res) => {
        if (err) { reject(err); }
        resolve(res);
      });
    });
  }
  async deleteOne(keySchema) {
    let params = {
      TableName: this.table.TableName,
      Key : keySchema
    }
    return new Promise((resolve, reject) => {
      this.dynoMongo.ddb.deleteItem(params, (err, res) => {
        if (err) { reject(err) } 
        else resolve(res);
      });
    });
  }
}

module.exports = Model;