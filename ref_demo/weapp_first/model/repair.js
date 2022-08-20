const AV = require('../utils/av-live-query-weapp-min');

class Repair extends AV.Object {

  get content() {
    return this.get('content');
  }
  set content(value) {
    this.set('content', value);
  }
}

AV.Object.register(Repair, 'Repair');
module.exports = Repair;