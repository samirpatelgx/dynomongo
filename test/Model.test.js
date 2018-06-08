const dynoMongo = require("../");
const dynoUtils = require("../lib/DynoUtils");
const testObjects = require("./testObjects")
const uuidv1 = require("uuid/v1");
const { Schema } = dynoMongo;
const delay = (ms) => { return new Promise(resolve => setTimeout(resolve,ms)) };

dynoMongo.AWS.config.update({
  accessKeyId: 'AKID',
  secretAccessKey: 'SECRET',
  region: 'us-east-1'
});

dynoMongo.local();
var personSchema, personTable, Person, newPerson, keySchema, newSchema, tableName

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
  }
})


describe("Model test", () => {


  
  beforeEach(async () => {
    tableName = "test";
    await delay(50);

    newSchema = dynoUtils.createDynamoTree(personSchema);
    personTable = dynoMongo.model(tableName, personSchema);
    Person = dynoMongo.model(tableName);
    newPerson = new Person(testObjects.personModel.people_one)
    
  });
  afterEach(async () => {
    await delay(50);
    // dynoMongo.ddb.deleteTable({
    //   TableName: personTable.table.TableName
    // }, (err, res) => {
    //   if (err) console.debug(err);
    //   console.debug(res)
    // })
    newSchema = null;
    personTable = null;
    Person = null;
    newPerson = null;
    delete dynoMongo.blueprints[tableName];
  })
  describe("Put Item", () => {
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
    it ("It should add an item to the database", async () => {
      let res = "error";
      try {
        await delay(50);
        res = await newPerson.save()
      }
      catch(err) {
        console.debug(err);
      };
      expect(res).toEqual({});
    });
  });
  describe("Delete Item", () => {
    beforeEach(() => {
      keySchema = dynoUtils.getKeySchema(newPerson);
      dynoMongo.ddb.putItem({
        TableName: personTable.table.TableName,
        Key : newSchema
      })
    })
    it ("It should delete an item from the database", async () => {
      let res = "error";
      try {
        await delay(50);
        res = await newPerson.deleteOne(keySchema);
      }
      catch(err) {
        console.debug(err);
      };
      expect(res).toEqual({});
    });
  });
});