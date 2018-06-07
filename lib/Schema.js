const dynoUtils = require("./DynoUtils");

class Schema {
  constructor(obj) {
    this.obj = dynoUtils.deepCopy(obj);
  }
}
module.exports = Schema;