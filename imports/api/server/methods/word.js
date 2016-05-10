import {Meteor} from 'meteor/meteor';
import PythonShell from 'python-shell';

import _ from 'underscore';

import ExposureEvidence from '/imports/collections/exposure';
import AnimalEvidence from '/imports/collections/animalEvidence';
import EpiDescriptive from '/imports/collections/epiDescriptive';
import GenotoxEvidence from '/imports/collections/genotox';
import MechanisticEvidence from '/imports/collections/mechanistic';


var Future = Npm.require('fibers/future'),
    pyWordHelperStdin = function(report_type, context, fut) {
        var report,
            options = {
                mode: 'json',
                scriptPath: Meteor.settings.scripts_path,
                pythonPath: Meteor.settings.python_path,
            },
            shell = new PythonShell('generateReport.py', options),
            inputs = {
                report_type: report_type,
                context: context,
            };

        shell.on('message', function(msg) {
            return report = msg.report;
        });
        shell.send(inputs);
        return shell.end(function(err) {
            if (err) {
                process.stdout.write(err.traceback);
            }
            return fut['return'](report);
        });
    },
    getContext = function(report_type, tbl_id) {
        switch (report_type) {
        case 'ExposureTables':
            return ExposureEvidence.wordContext(tbl_id);
        case 'EpiDescriptiveTables':
            return EpiDescriptive.wordContextByDescription([tbl_id]);
        case 'EpiResultTables':
            return EpiDescriptive.wordContextByResult([tbl_id]);
        case 'EpiHtmlTables':
            return EpiDescriptive.wordContextByDescription([tbl_id]);
        case 'AnimalHtmlTables':
            return AnimalEvidence.wordContext(tbl_id);
        case 'GenotoxTables':
            return GenotoxEvidence.wordContext(tbl_id);
        case 'MechanisticEvidenceHtmlTables':
            return MechanisticEvidence.wordContext(tbl_id);
        default:
            console.log(`No context specified: ${report_type}`);
        }
    };


Meteor.methods({
    wordReport: function(tbl_id, report_type) {
        this.unblock();

        var context = getContext(report_type, tbl_id),
            fut = new Future();

        // exit early if we have no context
        if (_.isNull(context)) return;

        // else run python
        pyWordHelperStdin(report_type, context, fut);
        return fut.wait();
    },
});
