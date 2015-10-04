'use strict';

const POLL_INTERVAL = 30*1000;

function Followers(nodecg) {
  this.nodecg = nodecg;
  this.twitch = nodecg.extensions['lfg-twitchapi'];
  this.latestFollower = nodecg.Replicant("latestFollower", {defaultValue: null, persistent: false});

  this._scheduleFollowers();
}

Followers.prototype._scheduleFollowers = function() {
  this.twitch.get('/channels/{{username}}/follows', { limit: 1, direction: 'desc' }, (err, code, body) => {
    if (err) {
      this.nodecg.log.error(err);
      setTimeout(() => { this._scheduleFollowers() }, POLL_INTERVAL);
      return;
    }

    if (code != 200) {
      this.nodecg.log.error("Unknown response code: "+code);
      setTimeout(() => { this._scheduleFollowers() }, POLL_INTERVAL);
      return;
    }

    if (body.follows.length > 0) {
      this.latestFollower.value = body.follows[0].display_name;
    }

    setTimeout(() => { this._scheduleFollowers() }, POLL_INTERVAL);
  });
}

module.exports = function(api) { 
  return new Followers(api);
};
