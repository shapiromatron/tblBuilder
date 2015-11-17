var r = Meteor.npmRequire('rserve-client'),
    Future = Meteor.npmRequire('fibers/future'),
    calculateTrendTest = function(obj, fut){
        var data = extractValues(obj);
        if (dataValid(data)) {
            data = JSON.stringify(data);
            runR(obj, data, fut);
        } else {
            updateResult(obj, {
                "trendTestReport": "Trend test cannot be calculated (<3 dose-groups).",
                "incidence_significance": obj.incidence_significance || "",
            });
            return fut["return"](undefined);
        }
    },
    dataValid = function(data){
        return ((data.ns.length>2) && (data.ns.length === data.incs.length));
    },
    textReport = function(res){
        var txt = "An error in calculation occurred.";
        if (res) txt = JSON.stringify(res, null, "\t");
        return txt;
    },
    updateIncidenceNotesText = function(obj){
        return obj.incidence_significance || "";
    },
    updateResult = function(obj, updates){
        v = AnimalEndpointEvidence.update(obj._id, {$set: updates});
    },
    getRCmd = function(data){
        var script = `${Meteor.settings.scripts_path}/R/stats.R`;
        return `source('${script}')\na<-getStats('${data}')`;
    },
    runR = function(obj, data, fut) {
        var result,
            cmd = getRCmd(data),
            updates;
        r.connect(Meteor.settings.r_host, Meteor.settings.r_port, Meteor.bindEnvironment(function(err, client) {
            client.evaluate(cmd, Meteor.bindEnvironment(function(err, res) {
                if (err) {
                    console.log(err);
                } else {
                    result = JSON.parse(res);
                }
                client.end();
                updates = {
                    "trendTestReport": textReport(res || null),
                    "incidence_significance": updateIncidenceNotesText(obj, res || null),
                };
                updateResult(obj, updates);
                return fut["return"](result);
            }));
        }));
    },
    extractValues = function(obj) {
        var v = {"ns": [], "incs": []}, matches;
        obj.endpointGroups.forEach(function(eg){
            matches = eg.incidence.match(/([\d]+)\s*[\/|\\]\s*([\d]+)/);
            if (_.isNull(matches) || matches.length < 3) return undefined;
            v.ns.push(parseInt(matches[2], 10));
            v.incs.push(parseInt(matches[1], 10));
        });
        return v;
    };

Meteor.methods({
    getAnimalBioassayStatistics: function(_id) {
        check(_id, String);
        this.unblock();
        var fut = new Future(),
            obj = AnimalEndpointEvidence.findOne(_id);
        calculateTrendTest(obj, fut);
        return fut.wait();
    },
});
