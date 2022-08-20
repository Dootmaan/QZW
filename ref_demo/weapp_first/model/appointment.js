const AV = require('../utils/av-live-query-weapp-min');

class Appointment extends AV.Object {

  get content() {
    return this.get('content');
  }
  set content(value) {
    this.set('content', value);
  }
}

AV.Object.register(Appointment, 'Appiontment');
module.exports = Appointment;