const AV = require('../utils/av-live-query-weapp-min');

class ExposureLike extends AV.Object {

  // get content() {
  //   return this.get('content');
  // }
  // set content(value) {
  //   this.set('content', value);
  // }
}

AV.Object.register(ExposureLike, 'ExposureLike');
module.exports = ExposureLike;