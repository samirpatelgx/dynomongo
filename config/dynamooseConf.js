const keys = require('./keys');
const dynamoose = require("dynamoose");

dynamoose.AWS.config.update({
  accessKeyId: keys.awsAccessKeyId,
  secretAccessKey: keys.awsSecretAccessKey,
  region: keys.awsRegion
});
if (process.env.NODE_ENV == "production") {
  
} else {
  dynamoose.local('http://localhost:8000');
}