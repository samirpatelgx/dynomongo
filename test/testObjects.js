const uuidv1 = require("uuid/v1");
const personModel = { 
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

const personSchemaDdb = {  
  "KeySchema":[  
     {  
        "AttributeName":"peopleId",
        "KeyType":"HASH"
     },
     {  
        "AttributeName":"count",
        "KeyType":"RANGE"
     }
  ],
  "AttributeDefinitions":[  
     {  
        "AttributeName":"peopleId",
        "AttributeType":"S"
     },
     {  
        "AttributeName":"count",
        "AttributeType":"N"
     }
  ],
  "TableName":"person_test_schema_one",
  "ProvisionedThroughput":{  
     "ReadCapacityUnits":2,
     "WriteCapacityUnits":2
  }
}
module.exports = { personModel, personSchemaDdb }