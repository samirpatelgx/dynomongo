class Table {
  constructor(name, schema, options, dynomongo) {
    this.table = {}
    this.name = name;
    this.schema = schema;
    this.options = options;
    this.dynomongo = dynomongo
    this.tableSchema = {}
  }
  async describe() {
    return await new Promise((resolve, reject) => { 
      this.dynomongo.ddb.describeTable({
        TableName: this.name
      }, (err, res) => {
        if (err) { reject(err); }
        resolve(res);
      });
    });
  }
  async createTable() {
    return await new Promise((resolve, reject) => { 
      this.dynomongo.ddb.createTable(this.table, (err, res) => {
        if (err) { reject(err); }
        resolve(res);
      });
    });
  }
  async deleteTable() {
    return await new Promise((resolve, reject) => { 
      this.dynomongo.ddb.deleteTable({
        TableName: this.name
      }, (err, res) => {
        if (err) { reject(err); }
        resolve(res);
      });
    });
  }
}
module.exports = Table;