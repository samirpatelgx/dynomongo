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
   peopleId: uuidv1(),
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
    peopleId: uuidv1(),
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


const itemObjTwo = { 
  pegdgdge: {
   peopleId: uuidv1(),
    count: "4",
    People: [{
      person_one: {
        age: { N : 12 },
        gender: { S : "male" },
        working: true
      }
    }]
  },
  peopls: {
    peopleId: uuidv1(),
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

personSchema = dynoMongo.model("person_schema", personSchema);

const Person = dynoMongo.model("person_schema");

const newPerson = new Person(itemObj.people_one)


newPerson.save()
  .then((res) => {
    console.log(res);
  })
  .catch(err => {
    console.log(err);
  });
const newPersonTwo = new Person(itemObjTwo)

var blogSchema = new Schema({
  blog: {
    type: String,
    hashKey: true
  },
  title:  {
    type: String,
    rangeKey: true
  },
  author: String,
  body:   String,
  comments: [{ 
    body: String,
    date: String
  }],
  date: { 
    type: String,
    default: String
  },
  hidden: String,
  meta: {
    votes: "Number",
    favs:  "Number"
  },
  throughput: 3
});

const blogS = dynoMongo.model("blogSchema", blogSchema)

// blogS.deleteTable();

const userSchema = new Schema({
  userId: {
    type: String,
    required: true,
    hashKey: true,
  },
  googleId: {
    type: String,
    required: true,
    index: {
      global: true,
      name: "googleId_index",
      project: false,
      throughput: 3
    }
  },
  credits: {
    type: Number,
    default: 0
  },
  throughput: {read: 3, write: 3}
});

const user = dynoMongo.model("users", userSchema);


// dynoUtils.traverseObjTree(itemObj,dynoUtils.convertToDynamoObj)
// console.log(JSON.stringify(itemObj));
// dynoUtils.traverseObjTree(userSchema,(obj, key, parentObj, childObj) => {
//   let newObj = obj[key];
//    console.log(`${newObj.name} ${obj} ${key} ${(obj[key].name)} ${parentObj} ${childObj}`)
//   } 
// )
// console.log(JSON.stringify(itemObj));