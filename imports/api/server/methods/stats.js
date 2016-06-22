import {Meteor} from 'meteor/meteor';
import { check } from 'meteor/check';
import PythonShell from 'python-shell';

import _ from 'underscore';

import AnimalEndpointEvidence from '/imports/collections/animalResult';


var Future = Npm.require('fibers/future'),
    calculateTrendTest = function(obj, fut){
        var data = extractValues(obj);
        if (dataValid(data)) {
            data = JSON.stringify(data);
            runPython(obj, data, fut);
        } else {
            var msg = 'Trend test cannot be calculated (<3 dose-groups).';
            updateResult(obj, msg, fut);
        }
    },
    extractValues = function(obj) {
        var v = {'ns': [], 'incs': []}, matches;
        obj.endpointGroups.forEach(function(eg){
            matches = eg.incidence.match(/([\d]+)\s*[\/|\\]\s*([\d]+)/);
            if (_.isNull(matches) || matches.length < 3) return undefined;
            v.ns.push(parseInt(matches[2], 10));
            v.incs.push(parseInt(matches[1], 10));
        });
        return v;
    },
    dataValid = function(data){
        return ((data.ns.length>2) && (data.ns.length === data.incs.length));
    },
    updateResult = function(obj, msg, fut){
        AnimalEndpointEvidence.update(
            obj._id, {$set: {trendTestReport: msg}});
        fut.return();
    },
    runPython = function(obj, payload, fut) {
        var response,
            options = {
                mode: 'text',
                scriptPath: Meteor.settings.scripts_path + '/stats',
                pythonPath: Meteor.settings.python_path,
            },
            shell = new PythonShell('stats.py', options);

        shell.on('message', (msg) => response = msg);
        shell.send(payload);
        shell.end(Meteor.bindEnvironment(function(err) {
            if (err) {
                process.stdout.write(err.traceback);
                updateResult(obj, err.traceback, fut);
            } else {
                updateResult(obj, response, fut);
            }
        }));
    };

Meteor.methods({
    getAnimalBioassayStatistics: function(_id) {
        check(_id, String);
        this.unblock();
        var fut = new Future(),
            obj = AnimalEndpointEvidence.findOne(_id);
        calculateTrendTest(obj, fut);
        fut.wait();
    },
});
