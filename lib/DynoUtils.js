"use strict";
const dynamoTypes = require("./DynoTypes")

class DynoUtils {
  static get types() {
   return dynamoTypes
  }
  static get logicTypes() {
    return ["=",">","<",">=","<="];
  }
  static getObjectType(obj) {
    if (obj instanceof Array) {
      return "array";
    } else {
      return typeof(obj);
    }
  }
  static returnDdbType(obj) {
    return obj["S"] || obj["M"] || obj["L"] || obj["BOOL"] || obj["N"]
  }
  static getDdbType(obj) {
    if (obj["S"]) { return "S"; }
    else if (obj["M"]) { return "M"; }
    else if (obj["L"]) { return "L"; }
    else if (obj["BOOL"]) { return "BOOL"; }
    else if (obj["N"]) { return "N"; }
    else { return null; }
  }
  static isEqualModel(table_one, table_two) {
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
  }
  static isEqual(obj_one, obj_two) {
    if (JSON.stringify(obj_one) === JSON.stringify(obj_two)) {
      return true;
    } else {
      return false;
    }
  }

  static convertToDynamoObj(obj, key, parentObjType, childObjType) {
    let parentObj = obj;
    let childObj = {};
    if (childObjType === "number") { 
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
  }
  // static convertDynToJsonObj(obj, key, parentObj) {
    
  //   Object.keys(obj).forEach((key) => {      
  //     let childObjType = DynoUtils.getObjectType(obj[key]);
  //     let parentObjType = DynoUtils.getObjectType(obj);
  //     if (parentObjType !== "string" && parentObjType !== "number" && parentObjType !== "boolean") {
  //       DynoUtils.convertDynToJsonObj(obj[key])
  //       let curDdbChildType = DynoUtils.returnDdbType(obj[key])
  //       if (curDdbChildType !== undefined) {
  //         obj[key] = curDdbChildType
  //       }
  //     }
  //   });
  // }
  static traverseObjTree(obj,callback) {
    let parentObjType = DynoUtils.getObjectType(obj);
    Object.keys(obj).forEach((key) => {      
      let childObjType = DynoUtils.getObjectType(obj[key]);
      if (parentObjType !== "string" && parentObjType !== "number" && parentObjType !== "boolean") {
        DynoUtils.traverseObjTree(obj[key], callback)
        callback(obj,key,parentObjType, childObjType)
      }
    }
    );
  }
  static iterateTableSchema(obj,callback) {
    let parentObjType = DynoUtils.getObjectType(obj);
    Object.keys(obj).forEach((key) => {      
      let childObjType = DynoUtils.getObjectType(obj[key]);
      if (parentObjType !== "string" && parentObjType !== "number" && parentObjType !== "boolean") {
        callback(obj,key,parentObjType, childObjType)
      }
    }
    );
  }
  static deepCopy(obj,callback) {
    let parentObjType = DynoUtils.getObjectType(obj);
    var newObj
    if (parentObjType === "string" || parentObjType === "number" || parentObjType === "boolean") {
      return obj;
    } else {
      if (parentObjType !== "array") {
        newObj = {};
      } else {
        newObj = [];
      }
    }
    Object.keys(obj).forEach((key) => {
      let childObjType = DynoUtils.getObjectType(obj[key]);
      if (childObjType !== "string" && childObjType !== "number" && childObjType !== "boolean") {
        if (callback !== undefined) {
          callback(obj,key);  
        }
        newObj[key] = DynoUtils.deepCopy(obj[key],callback)
      } else {
        newObj[key] = obj[key]
      }
    });
    return newObj;
  }
  static getKeySchema (modelObj) {
    let keySchemaParams = {}
    modelObj.table.table.KeySchema.forEach((key) => {
      if (key.KeyType === "HASH") {
        keySchemaParams[key.AttributeName] = modelObj.newSchema[key.AttributeName]
      } else if(key.KeyType === "RANGE") {
        keySchemaParams[key.AttributeName] = modelObj.newSchema[key.AttributeName]
      }
    });
    return keySchemaParams
  }
  static createQuery (modelObj) {
    modelObj = DynoUtils.createDynamoTree(modelObj);
    let keySchemaParams = {};
    let indexWords = [];
    let logic = "="
    keySchemaParams["ExpressionAttributeValues"] = {};
    keySchemaParams["ExpressionAttributeNames"] = {};
    keySchemaParams["KeyConditionExpression"] = "";
    Object.keys(modelObj).forEach((key,index) => {
      // console.log(modelObj[key].split(" ")[1]);
      keySchemaParams["ExpressionAttributeValues"][`:${key}`] = modelObj[key];
      keySchemaParams["ExpressionAttributeNames"][`#${key}`] = key;
      indexWords = DynoUtils.returnDdbType(modelObj[key]).split(" ");
      if (DynoUtils.logicTypes.includes(indexWords[0])) {
        logic = indexWords[0];
      }
      if (index > 0) { keySchemaParams["KeyConditionExpression"] += " and "; }
      keySchemaParams["KeyConditionExpression"] += `#${key} ${logic} :${key}`;
    });
    // keySchemaParams["KeyConditionExpression"] = keyConditionExpression;
    return keySchemaParams
  }
  // static getGlobalKeySchema (modelObj) {
  //   console.log(modelObj.table);
  //   let keySchemaParams = {}
  //   modelObj.table.GlobalSecondaryIndexes.forEach((key) => {
  //     if (key.KeyType === "HASH") {
  //       keySchemaParams[key.AttributeName] = modelObj.newSchema[key.AttributeName]
  //     } else if(key.KeyType === "RANGE") {
  //       keySchemaParams[key.AttributeName] = modelObj.newSchema[key.AttributeName]
  //     }
  //   });
  //   return keySchemaParams
  // }
  static createDynamoTree(tree) {
    if (tree) {
      const newTree = DynoUtils.deepCopy(tree)
      DynoUtils.traverseObjTree(newTree, DynoUtils.convertToDynamoObj)
      return newTree;
    } else {
      console.log("No tree object provided");
    }
  }
  static createDynToJsonTree(tree) {
    if (tree) {
      const newTree = DynoUtils.deepCopy(tree)
      
      DynoUtils.traverseObjTree(newTree,(obj, key) => {
        let curDdbChildType = DynoUtils.returnDdbType(obj[key])
        if (curDdbChildType !== undefined) {
          if (DynoUtils.getDdbType(obj[key]) === "N") {
            curDdbChildType = parseInt(curDdbChildType)
          }
          obj[key] = curDdbChildType
        }
      });
      return newTree;
    } else {
      console.log("No tree object provided");
    }
  }
}
module.exports = DynoUtils;