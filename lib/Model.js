const dynoUtils = require("./DynoUtils");
const Table = require("./Table");

class Model {
  constructor(obj) {
    this.table = {};
    for(var key in obj) {
      this[key] = obj[key];
    }
  }
  static compile(name, schema, options, dynomongo) {
    let newTableSchema = new Table(name, schema, options, dynomongo)
    newTableSchema.table.KeySchema = []
    newTableSchema.table.AttributeDefinitions = []
    newTableSchema.table.TableName = name;
    createTableSchema(schema, newTableSchema.table)
    newTableSchema.describe()
      .then(res => {
        if (dynoUtils.isEqualModel(res.Table,newTableSchema.table)) {
          //Table is already up-to-date.
        } else {
          //need to update the table
        }
      })
      .catch(async err => {
        if (err.name = "ResourceNotFoundException") {
          let createdRes = await newTableSchema.createTable();
          console.log(createdRes);
        }
      });
    return { model: Model, table: newTableSchema } ;
  }
  async save() {
    return await new Promise((resolve, reject) => { 
      this.dynomongo.ddb.createTable(this.schema, (err, res) => {
        if (err) { reject(err); }
        resolve(res);
      });
    });
  }
}
const createTableSchema = (schema, newTableSchema) => {
  dynoUtils.traverseObjTree(schema,(obj, key, parentObjType, childObjType) => {
    if (childObjType == "string") {
      obj[key] = obj[key].toLowerCase();
    }
    if (obj[key].hashKey == true) {
      newTableSchema.KeySchema.push({ 
        AttributeName: key,
        KeyType: "HASH"
      });
      newTableSchema.AttributeDefinitions.push({ 
        AttributeName: key,
        AttributeType: "S"
      });
    } 
    if (obj[key].rangeKey == true) {
      newTableSchema.KeySchema.push({ 
        AttributeName: key,
        KeyType: "RANGE"
      });
      newTableSchema.AttributeDefinitions.push({ 
        AttributeName: key,
        AttributeType: "S"
      });
    }
    if (obj[key].index) {
      if (obj[key].index.global == true) {
        newTableSchema.GlobalSecondaryIndexes.IndexName = obj[key].index.name;
        newTableSchema.GlobalSecondaryIndexes.KeySchema.push({
          AttributeName: key,
          AttributeType: "S"
        });
        newTableSchema.GlobalSecondaryIndexes.Projection.ProjectionType = obj[key].index.project
        newTableSchema.GlobalSecondaryIndexes.ProvisionedThroughput = { 
          ReadCapacityUnits: obj[key].index.throughput.read, 
          WriteCapacityUnits: obj[key].index.throughput.write
        }
      } 
      if (obj[key].index.local == true) {
        newTableSchema.LocalSecondaryIndexes.IndexName = obj[key].index.name;
        newTableSchema.LocalSecondaryIndexes.KeySchema.push({
          AttributeName: key,
          AttributeType: "S"
        });
        newTableSchema.LocalSecondaryIndexes.Projection.ProjectionType = obj[key].index.project
      }
    }
    if (key == "throughput") {
      if (obj[key].read && obj[key].write) {
        newTableSchema.ProvisionedThroughput = { 
          ReadCapacityUnits: obj[key].read, 
          WriteCapacityUnits: obj[key].write
        }
      }
      else if (dynoUtils.getObjectType(obj[key]) == "number") {
        newTableSchema.ProvisionedThroughput = { 
          ReadCapacityUnits: obj[key], 
          WriteCapacityUnits: obj[key]
        }
      }
    }
  });
}
module.exports = Model;