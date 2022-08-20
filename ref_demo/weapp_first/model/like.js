const AV = require('../utils/av-live-query-weapp-min');

class Like extends AV.Object {

  // get content() {
  //   return this.get('content');
  // }
  // set content(value) {
  //   this.set('content', value);
  // }
}

AV.Object.register(Like, 'Like');
module.exports = Like;