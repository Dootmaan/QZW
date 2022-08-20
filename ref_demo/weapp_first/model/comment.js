const AV = require('../utils/av-live-query-weapp-min');

class Comment extends AV.Object {

  get content() {
    return this.get('content');
  }
  set content(value) {
    this.set('content', value);
  }
}

AV.Object.register(Comment, 'Comment');
module.exports = Comment;