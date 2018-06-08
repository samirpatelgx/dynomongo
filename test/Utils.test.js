const dynoUtils = require("../lib/DynoUtils");
const testObjects = require("./testObjects");
const { Schema } = require("../");

const { personObject, personSchemaDdb } = testObjects;

var personSchema = new Schema({
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
  }
});

describe("Create Keys",() => {
  let keySchemaParams
  beforeEach(() => {
    keySchemaParams = dynoUtils.createDynamoTree(personSchema.obj);
  });
  it ("should create key schema", () => {
    // console.log(personSchema);
    // console.log(keySchemaParams);
    const expectedValue = {
      TableName: personSchema.name,
      Key : keySchemaParams
    };
  });
});