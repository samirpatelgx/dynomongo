"use strict";
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
var personSchema, personTable, Person, newPerson, keySchema, new_query, newSchema, tableName

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


describe("Model tests", () => {

  describe("Create and delete", () => {
    
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
      newSchema = null;
      personTable = null;
      Person = null;
      newPerson = null;
      delete dynoMongo.blueprints[tableName];
    })
    describe("Put Item", () => {
      beforeEach(() => {
        keySchema = { peopleId : newPerson.peopleId, count: newPerson.count }; // Here is what needs fixing - Need to create function that only works off Table.js and not Model.js
        keySchema = dynoUtils.createDynamoTree(keySchema)
      })
      afterEach(async () => {
        await delay(50);
        let params = {
          TableName: personTable.table.TableName,
          Key : keySchema
        };
        dynoMongo.ddb.deleteItem(params,(err,res) => { 
          if (err) { console.log(err) };
        });
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
        expect(res.People).toEqual(dynoUtils.createDynToJsonTree(testObjects.personModel.people_one.People));
        expect(res.count).toEqual(dynoUtils.createDynToJsonTree(testObjects.personModel.people_one.count));
        expect(res.userId).toEqual(dynoUtils.createDynToJsonTree(testObjects.personModel.people_one.userId));
      });
    });
    describe("Delete Item", () => {
      beforeEach(() => {
        keySchema = { peopleId : newPerson.peopleId, count: newPerson.count };
        dynoMongo.ddb.putItem({
          TableName: personTable.table.TableName,
          Item: dynoUtils.createDynamoTree(newPerson)
        },(err,res) => { 
          if (err) { console.log(err) };
        });
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
});
describe("Read tests", () => {
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
    newSchema = null;
    personTable = null;
    keySchema = null;
    new_query = null;
    Person = null;
    newPerson = null;
    delete dynoMongo.blueprints[tableName];
  })
  describe("Get Item", () => {
    beforeEach(() => {
      let params = {
        TableName: personTable.table.TableName,
        Item: dynoUtils.createDynamoTree(newPerson)
      };
      keySchema = { peopleId : newPerson.peopleId, count: newPerson.count };
      keySchema = dynoUtils.createDynamoTree(keySchema);
      dynoMongo.ddb.putItem(params,(err,res) => { 
        if (err) { console.log(err) };
      });
    });
    afterEach(async () => {
      await delay(50);
      let params = {
        TableName: personTable.table.TableName,
        Key : keySchema
      };
      dynoMongo.ddb.deleteItem(params,(err,res) => { 
        if (err) { console.log(err) };
      });
    })
    it ("It should get an item from the database", async () => {
      let res = "error";
      try {
        await delay(50);
        res = await Person.get(keySchema)
      }
      catch(err) {
        console.debug(err);
      };
      expect(res.People).toEqual(dynoUtils.createDynToJsonTree(testObjects.personModel.people_one.People));
      expect(res.count).toEqual(dynoUtils.createDynToJsonTree(testObjects.personModel.people_one.count));
      expect(res.userId).toEqual(dynoUtils.createDynToJsonTree(testObjects.personModel.people_one.userId));
    });
  });
  describe("Query Item", () => {
    beforeEach(() => {
      let params = {
        TableName: personTable.table.TableName,
        Item: dynoUtils.createDynamoTree(newPerson)
      };
      keySchema = { otherId : newPerson.otherId };
      keySchema = dynoUtils.createDynToJsonTree(keySchema);
      new_query = {
        projection: "People, #count, otherId, peopleId",
        attributeNames: { "#count": "count" }
      };
      dynoMongo.ddb.putItem(params,(err,res) => { 
        if (err) { console.log(err) };
      });
    });
    afterEach(async () => {
      await delay(50);
      keySchema = { peopleId : newPerson.peopleId, count: newPerson.count };
      keySchema = dynoUtils.createDynamoTree(keySchema);
      
      let params = {
        TableName: personTable.table.TableName,
        Key : keySchema
      };
      dynoMongo.ddb.deleteItem(params,(err,res) => { 
        if (err) { console.log(err) };
      });
    })
    it ("It should get an item from the database", async () => {
      let res = "error";
      try {
        await delay(50);
        res = await Person.query(keySchema, new_query)
      }
      catch(err) {
        console.debug(err);
      };
      expect({ Item: res[0] }).toEqual({ Item: dynoUtils.createDynToJsonTree(newPerson) });
    });
  });
  describe("Update Item", () => {
    beforeEach(() => {
      let params = {
        TableName: personTable.table.TableName,
        Item: dynoUtils.createDynamoTree(newPerson)
      };
      keySchema = { peopleId : newPerson.peopleId, count: newPerson.count };
      keySchema = dynoUtils.createDynToJsonTree(keySchema);
      new_query = {
        updateValues: "SET People[0].#person.age = :update_age",
        conditionValues: "People[0].#person.age = :curr_age",
        attributeNames: { "#person": "person_four" },
        attributeValues: { 
          ":update_age": 4,
          ":curr_age": 2 
        },
        returnValues: "ALL_NEW"
      };
      dynoMongo.ddb.putItem(params,(err,res) => { 
        if (err) { console.log(err) };
      });
    });
    afterEach(async () => {
      await delay(50);
      keySchema = { peopleId : newPerson.peopleId, count: newPerson.count };
      keySchema = dynoUtils.createDynamoTree(keySchema);
      
      let params = {
        TableName: personTable.table.TableName,
        Key : keySchema
      };
      dynoMongo.ddb.deleteItem(params,(err,res) => { 
        if (err) { console.log(err) };
      });
    })
    it ("It should get an item from the database", async () => {
      let res = "error";
      try {
        await delay(50);
        res = await Person.update(keySchema, new_query)
      }
      catch(err) {
        console.debug(err);
      };
      newPerson.People[0].person_four.age = 4
      expect({ Item: res }).toEqual({ Item: dynoUtils.createDynToJsonTree(newPerson) });
    });
  });
});