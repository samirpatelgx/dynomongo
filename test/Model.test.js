const dynoMongo = require("../");
const dynoUtils = require("../lib/DynoUtils");
const testObjects = require("./testObjects")
const { Schema } = dynoMongo;
dynoMongo.AWS.config.update({
  accessKeyId: 'AKID',
  secretAccessKey: 'SECRET',
  region: 'us-east-1'
});

dynoMongo.local();
var personSchema, personTable, Person, newPerson, keySchema, newSchema
newSchema = dynoUtils.createDynamoTree(personSchema);
const delay = (ms) => { return new Promise(resolve => setTimeout(resolve,ms)) };

describe("Model test", () => {

  
  personSchema = new Schema({
    peopleId: {
      type: "string",
      hashKey: true
    },
    count: {
      type: "number",
      rangeKey: true
    },
    throughput: 2
  })

  
  beforeEach(() => {
    personTable = dynoMongo.model("person_test_schema_one", personSchema);
    Person = dynoMongo.model("person_test_schema_one");
    newPerson = new Person(testObjects.personModel.people_one)
  });
  afterEach(async () => {
    await delay(50);
    dynoMongo.ddb.deleteTable({
      TableName: personTable.table.TableName
    }, (err, res) => {
      if (err) console.debug(err);
      console.debug(res)
    })
  })
  describe("Save to database", () => {
    beforeEach(() => {
      keySchema = dynoUtils.getKeySchema(newPerson); // Here is what needs fixing - Need to create function that only works off Table.js and not Model.js
    })
    afterEach(async () => {
      await delay(50);
      dynoMongo.ddb.deleteItem({
        TableName: personTable.table.TableName,
        Key : keySchema
      })
    })
    it ("It should save person data to the database", async () => {
      try {
        await delay(50);
        let res = await newPerson.save()
        console.debug(res);
      }
      catch(err) {
        console.debug(err);
      };
    });
  });
  describe("Delete an item from the database", () => {
    beforeEach(() => {
      keySchema = dynoUtils.getKeySchema(newPerson);
      dynoMongo.ddb.putItem({
        TableName: personTable.table.TableName,
        Key : keySchema
      })
    })
    it ("It should save person data to the database", async () => {
      try {
        await delay(50);
        let res = await newPerson.save()
        console.debug(res);
      }
      catch(err) {
        console.debug(err);
      };
    });
  });
});