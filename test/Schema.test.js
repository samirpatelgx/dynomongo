
const testObjects = require("./testObjects")
const dynoMongo = require("../");
const Schema = require("../lib/Schema")
const keys = require("../config/keys");
const dynoUtils = require("../lib/DynoUtils");

let newPerson = {
  peopleId: {
    type: "string",
    hashKey: true
  },
  count: {
    type: "number",
    rangeKey: true
  },
  throughput: 2
};

describe("Schema test", () => {
  it ("Creates a Schema", () => {
    let personSchema = new Schema(newPerson);
    expect(personSchema.obj).toEqual(newPerson)
    personSchema = null;
  });
});

