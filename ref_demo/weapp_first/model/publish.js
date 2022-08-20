const AV = require('../utils/av-live-query-weapp-min');

class Publish extends AV.Object {
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
  set shield(ONorOFF){
    if(ONorOFF == 'ON'){
    }
    this.set();
  }
}

AV.Object.register(Publish, 'Publish');
module.exports = Publish;