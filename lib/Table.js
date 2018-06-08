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

const setNewSchema = (obj,key,newTableSchema,currIndex) => {
  let objType = "string";
  let attributeExists = false;
  if (obj.type) {
    if (typeof(obj.type) == "function") objType = obj.type.name.toLowerCase();
    else objType = obj.type;
  }
  objType = dynoUtils.types.dynamo[objType];
  if (obj.hashKey == true) {
    if (obj.name) {
      currIndex.IndexName = obj.name;
    }
    currIndex.KeySchema = [];
    currIndex.KeySchema.push({ 
      AttributeName: key,
      KeyType: "HASH"
    });
    if (obj.project) {
      currIndex.Projection = {};
      currIndex.Projection.ProjectionType = obj.project;
    }
    Object.keys(newTableSchema.AttributeDefinitions).forEach((adKey) => {
      if (newTableSchema.AttributeDefinitions[adKey].AttributeName === key) { 
        attributeExists = true;
      }
    });
    if (!attributeExists) {
      newTableSchema.AttributeDefinitions.push({ 
        AttributeName: key,
        AttributeType: objType
      });
    }
  } 
  if (obj.rangeKey == true) {
    currIndex.KeySchema.push({ 
      AttributeName: key,
      KeyType: "RANGE"
    });
    newTableSchema.AttributeDefinitions.push({ 
      AttributeName: key,
      AttributeType: objType
    });
  }
  if (key == "throughput") {
    if (obj.read && obj.write) {
      currIndex.ProvisionedThroughput = { 
        ReadCapacityUnits: obj.read, 
        WriteCapacityUnits: obj.write
      }
    }
    else if (dynoUtils.getObjectType(obj) == "number") {
      currIndex.ProvisionedThroughput = { 
        ReadCapacityUnits: obj, 
        WriteCapacityUnits: obj
      }
    }
  }
};
const createTableSchema = (schema, newTableSchema) => {
  if (schema.obj.primary) {
    dynoUtils.iterateTableSchema(schema.obj.primary,(obj, key, parentObjType, childObjType) => {
      // if (childObjType == "string") {
      //   obj[key] = obj[key].toLowerCase();
      // }
      setNewSchema(obj[key],key,newTableSchema,newTableSchema);
    });
  }
  if (schema.obj.global) {
    dynoUtils.iterateTableSchema(schema.obj.global,(obj, key, parentObjType, childObjType) => {
      let gsi
      if (!newTableSchema.GlobalSecondaryIndexes) {
        newTableSchema.GlobalSecondaryIndexes = [];
        gsi = newTableSchema.GlobalSecondaryIndexes
        gsi[key] = {};
        gsi = gsi[key];
      }
      dynoUtils.iterateTableSchema(schema.obj.global[key],(obj, key, parentObjType, childObjType) => {
        setNewSchema(obj[key],key,newTableSchema,gsi);
      });
    });
  }
  if (schema.obj.local) {
    dynoUtils.iterateTableSchema(schema.obj.local,(obj, key, parentObjType, childObjType) => {
      let lsi
      if (!newTableSchema.LocalSecondaryIndexes) {
        newTableSchema.LocalSecondaryIndexes = [];
        lsi = newTableSchema.LocalSecondaryIndexes
        lsi[key] = {};
        lsi = lsi[key];
      }
      dynoUtils.iterateTableSchema(schema.obj.local[key],(obj, key, parentObjType, childObjType) => {
        setNewSchema(obj[key],key,newTableSchema,lsi);
      });
    });
  }
}
module.exports = Table;