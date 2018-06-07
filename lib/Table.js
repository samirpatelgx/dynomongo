const dynoUtils = require("./DynoUtils");

class Table {
  constructor(name, schema, dynoMongo, options) {
    this.table = {}
    this.name = name;
    this.schema = schema;
    this.newKeySchema = dynoUtils.createDynamoTree(schema)
    this.options = options;
    this.dynoMongo = dynoMongo
    this.createTableStruct();
  }
  async createTableStruct() {
    this.table.KeySchema = [];
    this.table.AttributeDefinitions = [];
    this.table.TableName = this.name;
    if (this.schema) {
      createTableSchema(this.schema,  this.table);
      if (this.dynoMongo) {
        try {
          let res = await this.describe()
          if (dynoUtils.isEqualModel(res.Table, this.table)) {
            //Table is already up-to-date.
          } else {
            //need to update the table
          }
        }
        catch(err) {
          if (err.name = "ResourceNotFoundException") {
            try {
              let createdRes = await this.create();
            } catch (err) {
            }
          }
        }
        } else {
          console.log("dynoMongo not provided.")
        }
      } else {
        console.log("No schema has been provided");
      }
  }
  describe() {
    return new Promise((resolve, reject) => { 
      this.dynoMongo.ddb.describeTable({
        TableName: this.name
      }, (err, res) => {
        if (err) { reject(err); }
        resolve(res);
      });
    });
  }
  create() {
    return new Promise((resolve, reject) => { 
      this.dynoMongo.ddb.createTable(this.table, (err, res) => {
        if (err) { reject(err); }
        resolve(res);
      });
    });
  }
  deleteTable() {
    return new Promise((resolve, reject) => { 
      this.dynoMongo.ddb.deleteTable({
        TableName: this.name
      }, (err, res) => {
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
        AttributeType: DynoUtils.types.dynamo[obj[key].type]
      });
    } 
    if (obj[key].rangeKey == true) {
      newTableSchema.KeySchema.push({ 
        AttributeName: key,
        KeyType: "RANGE"
      });
      newTableSchema.AttributeDefinitions.push({ 
        AttributeName: key,
        AttributeType: DynoUtils.types.dynamo[obj[key].type]
      });
    }
    if (obj[key].index) {
      if (obj[key].index.global == true) {
        newTableSchema.GlobalSecondaryIndexes = [];
        newTableSchema.GlobalSecondaryIndexes[0] = {};
        newTableSchema.GlobalSecondaryIndexes[0].IndexName = obj[key].index.name;
        newTableSchema.GlobalSecondaryIndexes[0].KeySchema = [];
        newTableSchema.GlobalSecondaryIndexes[0].KeySchema.push({
          AttributeName: key,
          AttributeType: "S"
        });
        newTableSchema.GlobalSecondaryIndexes[0].Projection = {};
        newTableSchema.GlobalSecondaryIndexes[0].Projection.ProjectionType = obj[key].index.project;
        newTableSchema.GlobalSecondaryIndexes[0].ProvisionedThroughput = { 
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
module.exports = Table;