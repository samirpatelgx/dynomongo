const dynoUtils = require("../lib/DynoUtils");
const testObjects = require("./testObjects");
const { Schema } = require("../");

const { personObject, personSchemaDdb } = testObjects;

personSchema = new Schema({
  primary: {
    peopleId: {
      type: "string",
      hashKey: true
    },
    count: {
      type: "number",
      rangeKey: true
    },
    throughput: 2
  },
  global: [{
    otherId: {
      type: "string",
      required: true,
      hashKey: true,
      name: "googleId_index",
      project: "ALL"
    },
    throughput: 2
  }]
})

describe("Create Keys",() => {
  let keySchemaParams
  beforeEach(() => {
    keySchemaParams = dynoUtils.createDynamoTree(personSchema.obj);
  });
  it ("should create key schema", () => {
    const expectedValue = {
      "global": [{
        "otherId": {
          "hashKey": true,
          "name": "googleId_index",
          "project": "ALL",
          "required": true,
          "type": "string"
        },
        "throughput": 2
      }],
      "primary": {
        "count": {
          "rangeKey": true,
          "type": "number"
        },
        "peopleId": {
          "hashKey": true,
          "type": "string"
        },
        "throughput": 2
      }
    };
    expect(dynoUtils.createDynToJsonTree(keySchemaParams)).toEqual(expectedValue);
  });
});