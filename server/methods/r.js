var r = Meteor.npmRequire('rserve-client'),
    Future = Meteor.npmRequire('fibers/future'),
    rClientHelper = function(cmd, fut) {
      var result;
      return r.connect(Meteor.settings.r_host, Meteor.settings.r_port, function(err, client) {
        return client.evaluate(cmd, function(err, res) {
          if (err) {
            console.log(err);
          } else {
            result = JSON.parse(res);
          }
          client.end();
          return fut["return"](result);
        });
      });
    },
    extractValues = function(_id) {
      var grp, i, len, matches, ref, res, v;
      res = AnimalEndpointEvidence.findOne(_id);
      v = {"ns": [], "incs": []};
      ref = res.endpointGroups;
      for (i = 0, len = ref.length; i < len; i++) {
        grp = ref[i];
        matches = grp.incidence.match(/([\d]+)\/([\d]+)/);
        if (matches.length < 3) return undefined;
        v.ns.push(parseInt(matches[2], 10));
        v.incs.push(parseInt(matches[1], 10));
      }
      return v;
    };

Meteor.methods({
  getAnimalBioassayStatistics: function(_id) {
    var cmd, data, fut, script;
    this.unblock();
    fut = new Future();
    script = Meteor.settings.scripts_path + "/R/stats.R";
    data = extractValues(_id);
    if (data) {
      data = JSON.stringify(data);
    } else {
      return fut["return"](undefined);
    }
    cmd = "source('" + script + "')\na<-getStats('" + data + "')";
    rClientHelper(cmd, fut);
    return fut.wait();
  }
});
