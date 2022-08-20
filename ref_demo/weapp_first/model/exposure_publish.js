const AV = require('../utils/av-live-query-weapp-min');

class ExposurePublish extends AV.Object {

  get content() {
    return this.get('content');
  }
  set content(value) {
    this.set('content', value);
  }
}

AV.Object.register(ExposurePublish, 'ExposurePublish');
module.exports = ExposurePublish;