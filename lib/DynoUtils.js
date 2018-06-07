const dynamoTypes = require("./DynoTypes")

DynoUtils = {
  types: dynamoTypes,
  getObjectType: (obj) => {
    if (obj instanceof Array) {
      return "array";
    } else {
      return typeof(obj);
    }
  },

  returnDdbType: (obj) => {
    return obj["S"] || obj["M"] || obj["L"] || obj["BOOL"] || obj["N"]
  },

  isEqualModel: (table_one, table_two) => {
    let isEqual = true;
    let comparer = "";
    comparer = "AttributeDefinitions";
    if (!DynoUtils.isEqual(table_one[comparer], table_two[comparer])) {
      isEqual = false;
    }
    comparer = "ProvisionedThroughput";
    if (!DynoUtils.isEqual(table_one[comparer].ReadCapacityUnits, table_two[comparer].ReadCapacityUnits)) {
      isEqual = false;
    }
    if (!DynoUtils.isEqual(table_one[comparer].WriteCapacityUnits, table_two[comparer].WriteCapacityUnits)) {
      isEqual = false;
    }
    comparer = "KeySchema";
    if (!DynoUtils.isEqual(table_one[comparer], table_two[comparer])) {
      isEqual = false;
    }
    return isEqual;
  },
  isEqual: (obj_one, obj_two) => {
    if (JSON.stringify(obj_one) === JSON.stringify(obj_two)) {
      return true;
    } else {
      return false;
    }
  },

  convertToDynamoObj: (obj, key, parentObjType, childObjType) => {
    let parentObj = obj;
    let childObj = {};
    if (childObjType == "number") { 
      obj[key] = obj[key].toString();
    }
    let newDdbParentType = dynamoTypes.dynamo[childObjType];
    let curDdbChildType = DynoUtils.returnDdbType(obj[key]);
    let curDdbParentType = DynoUtils.returnDdbType(obj)
    if (!curDdbChildType && !curDdbParentType) {
      if (!childObj[newDdbParentType]) {
        childObj[newDdbParentType] = {}
      }
      // childObj[newDdbParentType] = Object.assign(obj[key])
      childObj[newDdbParentType] = obj[key]
      parentObj[key] = childObj
    }
  },
  traverseObjTree: (obj,callback) => {
    let parentObjType = DynoUtils.getObjectType(obj);
    Object.keys(obj).forEach((key) => {      
      let childObjType = DynoUtils.getObjectType(obj[key]);
      if (parentObjType != "string" && parentObjType != "number" && parentObjType != "boolean") {
        // if (parentObjType == "object") {
        DynoUtils.traverseObjTree(obj[key], callback)
        callback(obj,key,parentObjType, childObjType)
      }
    }
    );
  },
  deepCopy: (obj,callback) => {
    parentObjType = DynoUtils.getObjectType(obj);
    var newObj
    if (parentObjType != "array") {
      newObj = {};
    } else {
      newObj = [];
    }
    Object.keys(obj).forEach((key) => {
      let childObjType = DynoUtils.getObjectType(obj[key]);
      if (childObjType != "string" && childObjType != "number" && childObjType != "boolean") {
        if (callback != undefined) {
          callback(obj,key);
        }
        newObj[key] = DynoUtils.deepCopy(obj[key],callback)
      } else {
        newObj[key] = obj[key]
      }
    });
    return newObj;
  },
  getKeySchema: (modelObj) => {
    let keySchemaParams = {}
    modelObj.table.KeySchema.forEach((key) => {
      if (key.KeyType === "HASH") {
        keySchemaParams[key.AttributeName] = modelObj.newSchema[key.AttributeName]
      } else if(key.KeyType === "RANGE") {
        keySchemaParams[key.AttributeName] = modelObj.newSchema[key.AttributeName]
      }
    });
    return keySchemaParams
  },
  createDynamoTree: (tree) => {
    if (tree) {
      const newTree = DynoUtils.deepCopy(tree)
      DynoUtils.traverseObjTree(newTree, DynoUtils.convertToDynamoObj)
      return newTree;
    } else {
      console.log("No tree object provided");
    }
  }
}
module.exports = DynoUtils;