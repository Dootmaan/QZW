const AV = require('../utils/av-live-query-weapp-min');

class ExposureComment extends AV.Object {

  get content() {
    return this.get('content');
  }
  set content(value) {
    this.set('content', value);
  }
}

AV.Object.register(ExposureComment, 'ExposureComment');
module.exports = ExposureComment;