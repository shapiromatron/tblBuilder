import {Meteor} from 'meteor/meteor';

import _ from 'underscore';

import ExposureEvidence from '/imports/collections/exposure';
import NtpAnimalEvidence from '/imports/collections/ntpAnimalEvidence';
import AnimalEvidence from '/imports/collections/animalEvidence';
import EpiDescriptive from '/imports/collections/epiDescriptive';
import GenotoxEvidence from '/imports/collections/genotox';
import MechanisticEvidence from '/imports/collections/mechanistic';
import NtpEpiDescriptive from '/imports/collections/ntpEpiDescriptive';

import {
    getPyShell,
} from '/imports/api/server/utilities';


var Future = Npm.require('fibers/future'),
    pyWordHelperStdin = function(report_type, context, fut) {
        var report,
            shell = getPyShell('generateReport.py'),
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
        case 'ExposureHtmlTable':
            return ExposureEvidence.wordHtmlContext(tbl_id);
        case 'EpiResultTables':
            return EpiDescriptive.wordContextByResult([tbl_id]);
        case 'EpiHtmlTables':
            return EpiDescriptive.wordContextByDescription([tbl_id]);
        case 'NtpAnimalHtmlTables':
            return NtpAnimalEvidence.wordContext(tbl_id);
        case 'NtpAnimalBias':
            return NtpAnimalEvidence.wordContext(tbl_id);
        case 'AnimalHtmlTables':
            return AnimalEvidence.wordContext(tbl_id);
        case 'GenotoxTables':
            return GenotoxEvidence.wordContext(tbl_id);
        case 'GenotoxHtmlTables':
            return GenotoxEvidence.wordHtmlContext(tbl_id);
        case 'MechanisticEvidenceHtmlTables':
            return MechanisticEvidence.wordContext(tbl_id);
        case 'NtpEpiResultTables':
            return NtpEpiDescriptive.wordContextWithResults([tbl_id]);
        case 'NtpEpiBiasTables':
            return NtpEpiDescriptive.wordContext([tbl_id]);
        case 'NtpEpiBiasRatings':
            return NtpEpiDescriptive.wordContext([tbl_id]);
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
