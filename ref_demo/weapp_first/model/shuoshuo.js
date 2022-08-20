const AV = require('../utils/av-live-query-weapp-min');

class ShuoShuo extends AV.Object {
  get done() {
    return this.get('done');
  }
  set done(value) {
    this.set('done', value);
  }

  get content() {
    return this.get('content');
  }
  set content(value) {
    this.set('content', value);
  }
}

AV.Object.register(ShuoShuo, 'ShuoShuo');
module.exports = ShuoShuo;