"use strict";
const dynoUtils = require("./DynoUtils");

class Table {
  constructor(name, schema, ddb, options) {
    this.table = {}
    this.name = name;
    this.schema = schema;
    this.newKeySchema = dynoUtils.createDynamoTree(schema)
    this.options = options;
    this.ddb = ddb
    this.internalAttributes = {};
    this.createTableStruct();
  }
  async createTableStruct() {
    this.table.KeySchema = [];
    this.table.AttributeDefinitions = [];
    this.table.TableName = this.name;
    if (this.schema) {
      createTableSchema(this);
      if (this.ddb) {
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
              console.log(err);
            }
          }
        }
        } else {
          console.log("DynamoDB not provided.")
        }
      } else {
        console.log("No schema has been provided");
      }
  }
  describe(callback) {
    return new Promise((resolve, reject) => { 
      this.ddb.describeTable({
        TableName: this.name
      }, (err, res) => {
        if (callback) {
          callback(err,res);
        }
        else {
          if (err) { reject(err); }
        }
        resolve(res);
      });
    });
  }
  create(callback) {
    return new Promise((resolve, reject) => { 
      this.ddb.createTable(this.table, (err, res) => {
        if (callback) {
          callback(err,res);
        }
        else {
          if (err) { reject(err); }
        }
        resolve(res);
      });
    });
  }
  deleteTable(callback) {
    return new Promise((resolve, reject) => { 
      this.ddb.deleteTable({
        TableName: this.name
      }, (err, res) => {
        if (callback) {
          callback(err,res);
        }
        else {
          if (err) { reject(err); }
        }
        resolve(res);
      });
    });
  }
  static get(data, callback) {
    data = dynoUtils.createDynamoTree(data)
    let params = {
      TableName: this.prototype.table.name,
      Key: data
    }
    return new Promise((resolve, reject) => {
      this.prototype.ddb.getItem(params, (err, res) => {
        let resObject, NewObject;
        if (res) {
          resObject = dynoUtils.createDynToJsonTree(res.Item);
          NewObject = this.prototype.NewModel
          resObject = new NewObject(resObject);
        }
        if (callback) {
          callback(err,resObject);
        }
        else {
          if (err) { reject(err); }
        }
        resolve(resObject);
      });
    });
  };
  static query(data, { filter, projection, attributeValues, attributeNames, keyCondition }, callback) {
    let query = dynoUtils.createQuery(data)
    let params = {
      TableName: this.prototype.table.name,
      IndexName: this.prototype.table.internalAttributes[Object.keys(data)[0]].IndexName,
      ExpressionAttributeValues: query.ExpressionAttributeValues,
      ExpressionAttributeNames: query.ExpressionAttributeNames,
      KeyConditionExpression: query.KeyConditionExpression
    }
    if (filter) {
      params.FilterExpression = filter;
    }
    if (projection) {
      params.ProjectionExpression = projection;
    }
    if (attributeValues) {
      params.ExpressionAttributeValues =  {...params.ExpressionAttributeValues,...dynoUtils.createDynamoTree(attributeValues)};
    }
    if (keyCondition) {
      params.KeyConditionExpression =  {...params.KeyConditionExpression,...dynoUtils.createDynamoTree(keyCondition)};
    }
    if (attributeNames) {
      params.ExpressionAttributeNames = {...params.ExpressionAttributeNames,...attributeNames};
    }
    // Object.assign({},query.ExpressionAttributeValues,attributeValues)
    return new Promise((resolve, reject) => {
      this.prototype.ddb.query(params, (err, res) => {
        let resObject, NewObject;
        if (res) {
          resObject = dynoUtils.createDynToJsonTree(res.Items);
          // NewObject = this.prototype.dynoMongo.model(this.prototype.table.name);
          // NewObject = this.prototype.NewModel
          // resObject = new NewObject(resObject);
        }
        if (callback) {
          callback(err,resObject);
        }
        else {
          if (err) { reject(err); }
        }
        resolve(resObject);
      });
    });
  };
  static update(data, { updateValues, conditionValues, attributeNames, attributeValues, returnValues }, callback) {
    // let query = dynoUtils.createQuery(data)
    data = dynoUtils.createDynamoTree(data)
    let params = {
      TableName: this.prototype.table.name,
      Key: data,
    }
    if (updateValues) {
      params.UpdateExpression = updateValues;
    }
    if (conditionValues) {
      params.ConditionExpression = conditionValues;
    }
    if (attributeValues) {
      params.ExpressionAttributeValues = dynoUtils.createDynamoTree(attributeValues);
    }
    if (returnValues) {
      params.ReturnValues = returnValues;
    }
    if (attributeNames) {
      params.ExpressionAttributeNames = attributeNames;
    }
    return new Promise((resolve, reject) => {
      this.prototype.ddb.updateItem(params, (err, res) => {
        let resObject, NewObject;
        if (res) {
          if (res.Attributes) {
            resObject = dynoUtils.createDynToJsonTree(res.Attributes);
          }
          else {
            resObject = res
          }
          NewObject = this.prototype.NewModel
          resObject = new NewObject(resObject);
        }
        if (callback) {
          callback(err,resObject);
        }
        else {
          if (err) { reject(err); }
        }
        resolve(resObject);
      });
    });
  };
}

const setNewSchema = (obj,key,{ table, internalAttributes },currIndex) => {
  let newTableSchema = table
  let objType = "string";
  let attributeExists = false;
  if (obj.type) {
    if (typeof(obj.type) === "function") objType = obj.type.name.toLowerCase();
    else objType = obj.type;
  }
  objType = dynoUtils.types.dynamo[objType];
  if (obj.hashKey === true) {
    Object.keys(newTableSchema.AttributeDefinitions).forEach((adKey) => {
      if (newTableSchema.AttributeDefinitions[adKey].AttributeName === key) { 
        attributeExists = true;
      }
    });
    if (!attributeExists) {
      internalAttributes[key] = {};
      newTableSchema.AttributeDefinitions.push({ 
        AttributeName: key,
        AttributeType: objType
      });
    }
    if (obj.name) {
      internalAttributes[key].IndexName = obj.name;
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
  } 
  if (obj.rangeKey === true) {
    currIndex.KeySchema.push({ 
      AttributeName: key,
      KeyType: "RANGE"
    });
    newTableSchema.AttributeDefinitions.push({ 
      AttributeName: key,
      AttributeType: objType
    });
  }
  if (key === "throughput") {
    if (obj.read && obj.write) {
      currIndex.ProvisionedThroughput = { 
        ReadCapacityUnits: obj.read, 
        WriteCapacityUnits: obj.write
      }
    }
    else if (dynoUtils.getObjectType(obj) === "number") {
      currIndex.ProvisionedThroughput = { 
        ReadCapacityUnits: obj, 
        WriteCapacityUnits: obj
      }
    }
  }
};
const createTableSchema = (thisVal) => {
  let { schema, table } = thisVal;
  if (schema.obj.primary) {
    dynoUtils.iterateTableSchema(schema.obj.primary,(obj, key, parentObjType, childObjType) => {
      // if (childObjType === "string") {
      //   obj[key] = obj[key].toLowerCase();
      // }
      setNewSchema(obj[key],key,thisVal,table);
    });
  }
  if (schema.obj.global) {
    dynoUtils.iterateTableSchema(schema.obj.global,(obj, key, parentObjType, childObjType) => {
      let gsi
      if (!table.GlobalSecondaryIndexes) {
        table.GlobalSecondaryIndexes = [];
        gsi = table.GlobalSecondaryIndexes
        gsi[key] = {};
        gsi = gsi[key];
      }
      dynoUtils.iterateTableSchema(schema.obj.global[key],(obj, key, parentObjType, childObjType) => {
        setNewSchema(obj[key],key,thisVal,gsi);
      });
    });
  }
  if (schema.obj.local) {
    dynoUtils.iterateTableSchema(schema.obj.local,(obj, key, parentObjType, childObjType) => {
      let lsi
      if (!table.LocalSecondaryIndexes) {
        table.LocalSecondaryIndexes = [];
        lsi = table.LocalSecondaryIndexes
        lsi[key] = {};
        lsi = lsi[key];
      }
      dynoUtils.iterateTableSchema(schema.obj.local[key],(obj, key, parentObjType, childObjType) => {
        setNewSchema(obj[key],key,thisVal,lsi);
      });
    });
  }
}
module.exports = Table;