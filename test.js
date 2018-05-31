const dynoMongo = require("./");
const keys = require("./config/keys");
const dynoUtils = require("./lib/DynoUtils");
const uuidv1 = require("uuid/v1");
const { Schema } = dynoMongo;

dynoMongo.AWS.config.update({
  accessKeyId: keys.awsAccessKeyId,
  secretAccessKey: keys.awsSecretAccessKey,
  region: keys.awsRegion
})
dynoMongo.local();

const itemObj = { 
  people_one: {
   userId: uuidv1(),
    count: 4,
    People: [{
      person_one: {
        age: { N : 12 },
        gender: { S : "male" },
        working: true
      },
      person_two: {
        age: 4,
        gender: "female"
      },
      person_three: {
        age: 6,
        gender: "other"
      },
      person_four: {
        age: 2,
      }
    }]
  },
  people_two: {
    userId: uuidv1(),
    count: 2,
    People: [{
      person_one: {
        age: { N : 12 },
        gender: { S : "male" },
        working: true
      },
      person_two: {
        age: 4,
        gender: "female"
      },
    }]
  }
}
var personSchema = new Schema({
  person: {
    type: "string",
    hashKey: true
  },
  person: {
    count: "string",
    rangeKey: true
  },
  throughput: 2
})

personSchema = dynoMongo.model("person_schema", personSchema);

const Person = dynoMongo.model("person_schema");

const newPerson = new Person(itemObj)

// var blogSchema = new Schema({
//   blog: {
//     type: String,
//     hashKey: true
//   },
//   title:  {
//     type: String,
//     rangeKey: true
//   },
//   author: String,
//   body:   String,
//   comments: [{ 
//     body: String,
//     date: String
//   }],
//   date: { 
//     type: String,
//     default: String
//   },
//   hidden: String,
//   meta: {
//     votes: "Number",
//     favs:  "Number"
//   },
//   throughput: 3
// });

// blogS = dynoMongo.model("blogSchema", blogSchema)

// blogS.deleteTable();

// const userSchema = new Schema({
//   userId: {
//     type: String,
//     required: true,
//     hashKey: true,
//   },
//   googleId: {
//     type: String,
//     required: true,
//     index: {
//       global: true,
//       name: "googleId_index",
//       project: false,
//       throughput: 3
//     }
//   },
//   credits: {
//     type: Number,
//     default: 0
//   },
//   throughput: {read: 3, write: 3}
// });

// dynamoose.model("users", userSchema);


// dynoUtils.traverseObjTree(itemObj,dynoUtils.convertToDynamoObj)
// console.log(JSON.stringify(itemObj));
// dynoUtils.traverseObjTree(userSchema,(obj, key, parentObj, childObj) => {
//   let newObj = obj[key];
//    console.log(`${newObj.name} ${obj} ${key} ${(obj[key].name)} ${parentObj} ${childObj}`)
//   } 
// )
// console.log(JSON.stringify(itemObj));