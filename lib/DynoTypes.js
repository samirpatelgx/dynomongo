"use strict";

module.exports = { 
  dynamo: {
    string: "S",
    object: "M",
    array: "L",
    boolean: "BOOL",
    number: "N",
  },
  object: {
    S: "string",
    M: "object",
    L: "array",
    BOOL: "boolean",
    N: "number"
  }
}