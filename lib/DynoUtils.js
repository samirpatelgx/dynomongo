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

  convertToDynamoObj: (obj, key, parentObjType, childObjType) => {
    let parentObj = obj;
    let childObj = {};
    let newDdbParentType = dynamoTypes.dynamo[childObjType];
    let curDdbChildType = DynoUtils.returnDdbType(obj[key]);
    let curDdbParentType = DynoUtils.returnDdbType(obj)
    if (!curDdbChildType && !curDdbParentType) {
      if (!childObj[newDdbParentType]) {
        childObj[newDdbParentType] = {}
      }
      childObj[newDdbParentType] = Object.assign(obj[key])
      parentObj[key] = childObj
    }
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
  traverseObjTree: (obj,callback) => {
      Object.keys(obj).forEach((key) => {
      let parentObj = obj
      let parentObjType = DynoUtils.getObjectType(obj);
      let childObjType = DynoUtils.getObjectType(obj[key]);
      if (parentObjType != "string" && parentObjType != "number" && parentObjType != "boolean") {
        // if (parentObjType == "object") {
        DynoUtils.traverseObjTree(obj[key], callback)
        callback(obj,key,parentObjType, childObjType)
      }
    }
    );
  }
}
module.exports = DynoUtils;