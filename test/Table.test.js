
const testObjects = require("./testObjects")
const dynoMongo = require("../");
const Table = require("../lib/Table")
const keys = require("../config/keys");
const dynoUtils = require("../lib/DynoUtils");

const { Schema } = dynoMongo;

dynoMongo.AWS.config.update({
  accessKeyId: 'AKID',
  secretAccessKey: 'SECRET',
  region: 'us-east-1'
});

dynoMongo.local();

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
})

// personSchema = dynoMongo.model("person_test_schema_one", personSchema);

// const Person = dynoMongo.model("person_test_schema_one");

describe("Database Test", () => {
  it ("It should be connected to DynamoDB database", () => {
    expect(dynoMongo).toBeDefined();
  })
}) ;
describe("Table Test", () => {
  var personTable
  beforeEach(() => {
    personTable = new Table("person_test_schema_one");
  })
  afterEach(() => {
    personTable = null;
  })
  it ("It should create a new table class without schema", () => {
    expect(personTable).toBeDefined();
  })
  describe("Table methods", () => {
    beforeEach(() => {
      personTable.table = personSchemaDdb;
      personTable.dynoMongo = dynoMongo
    })
    afterEach(() => {
      personTableRes = null;
    })
    it ("It should create a table in DynamoDB", async () => {
      personTable.table = personSchemaDdb;
      personTable.dynoMongo = dynoMongo
      const personTableRes = await personTable.create();
      expect(personTableRes.TableDescription.KeySchema).toEqual(personSchemaDdb.KeySchema);
      expect(personTableRes.TableDescription.ProvisionedThroughput.ReadCapacityUnits).toEqual(personSchemaDdb.ProvisionedThroughput.ReadCapacityUnits);
      expect(personTableRes.TableDescription.ProvisionedThroughput.WriteCapacityUnits).toEqual(personSchemaDdb.ProvisionedThroughput.WriteCapacityUnits);
      expect(personTableRes.TableDescription.AttributeDefinitions).toEqual(personSchemaDdb.AttributeDefinitions);
    });
    it ("It should describe a table in DynamoDB", async () => {
      const personTableRes = await personTable.describe();
      expect(personTableRes.Table.KeySchema).toEqual(personSchemaDdb.KeySchema);
      expect(personTableRes.Table.ProvisionedThroughput.ReadCapacityUnits).toEqual(personSchemaDdb.ProvisionedThroughput.ReadCapacityUnits);
      expect(personTableRes.Table.ProvisionedThroughput.WriteCapacityUnits).toEqual(personSchemaDdb.ProvisionedThroughput.WriteCapacityUnits);
      expect(personTableRes.Table.AttributeDefinitions).toEqual(personSchemaDdb.AttributeDefinitions);
    });
    it ("It should delete a table in DynamoDB", async () => {
      const personTableRes = await personTable.deleteTable();
      expect(personTableRes.TableDescription.KeySchema).toEqual(personSchemaDdb.KeySchema);
      expect(personTableRes.TableDescription.ProvisionedThroughput.ReadCapacityUnits).toEqual(personSchemaDdb.ProvisionedThroughput.ReadCapacityUnits);
      expect(personTableRes.TableDescription.ProvisionedThroughput.WriteCapacityUnits).toEqual(personSchemaDdb.ProvisionedThroughput.WriteCapacityUnits);
      expect(personTableRes.TableDescription.AttributeDefinitions).toEqual(personSchemaDdb.AttributeDefinitions);
    });
  });

})