import _ from 'underscore';
import {Meteor} from 'meteor/meteor';

import XLSX from 'xlsx-style';

import tblBuilderCollections from '/imports/collections';
import Reference from '/imports/collections/reference';
import ExposureEvidence from '/imports/collections/exposure';
import AnimalEvidence from '/imports/collections/animalEvidence';
import NtpAnimalEvidence from '/imports/collections/ntpAnimalEvidence';
import EpiDescriptive from '/imports/collections/epiDescriptive';
import NtpEpiDescriptive from '/imports/collections/ntpEpiDescriptive';
import NtpEpiResult from '/imports/collections/ntpEpiResult';
import NtpEpiConfounder from '/imports/collections/ntpEpiConfounder';
import GenotoxEvidence from '/imports/collections/genotox';
import MechanisticEvidence from '/imports/collections/mechanistic';
import GenotoxHumanExposureEvidence from '/imports/collections/genotoxHumanExposure';


let biasWorksheetExport = function(Coll, tbl_id){

        let schema = schema = Coll.simpleSchema()._schema,
            objects = Coll.getTableEvidence(tbl_id),
            extraMetadata = Coll.worksheetLabels;

        // get reference
        _.each(objects, (d) => d.getReference());

        // get header row, all bias fields in schema
        let headerCols = _.chain(schema)
                .each(function(v,k){v._name = k;})
                .where({biasField: true})
                .pluck('_name')
                .value(),
            biasHeaderColumns = _.clone(headerCols);

        // add header reference details
        let extraHeaderCols = _.map(extraMetadata, (d) => schema[d].label);
        extraHeaderCols.unshift.apply(extraHeaderCols, ['Reference ID', 'Reference name']);
        headerCols.unshift.apply(headerCols, extraHeaderCols);

        // create reference ids
        let rows = _.map(objects, (d) => {
            let row = _.map(biasHeaderColumns, (fld) => d[fld]),
                extraCols = _.map(extraMetadata, (fld) => d[fld]);
            extraCols.unshift.apply(extraCols, [d.reference._id, d.reference.name]);
            row.unshift.apply(row, extraCols);
            return row;
        });

        // add header column to rows
        rows.unshift(headerCols);

        return rows;
    },
    biasWorksheetSummary = function(Coll, tbl_id){
        let schema = schema = Coll.simpleSchema()._schema,
            bgColors = Coll.biasBgColors,
            textColors = Coll.biasTextColors,
            objects = Coll.getTableEvidence(tbl_id),
            dataKeys = _.chain(schema)
                .each((v, k) => v._name = k)
                .filter((d) => d.biasSummary)
                .groupBy('biasSummary')
                .map((v, k) => {
                    let labels = v.map((obj) => ({label: obj.labelHdr || obj.label, key: obj._name}));
                    labels.unshift({label: k, section: true, style: {font: {bold: true}}});
                    return labels;
                })
                .flatten()
                .value(),
            headerRow = dataKeys.map((k) => ({value: k.label, style: k.style}));

        // get reference
        _.each(objects, (d) => d.getReference());

        let rows = objects.map((d) => {
            let row = _.map(dataKeys, (heading) => {
                return heading.section ?
                {} :
                {
                    value: d[heading.key],
                    style: {
                        font: {color: {rgb: textColors(d[heading.key])}},
                        fill: {fgColor: {rgb: bgColors(d[heading.key])}},
                        border: {
                            top: {style: 'thin'},
                            bottom: {style: 'thin'},
                            right: {style: 'thin'},
                            left: {style: 'thin'},
                        },
                        alignment: {
                            vertical: 'center',
                            horizontal: 'center',
                        },
                    },
                };
            });
            row[0] = {
                value: d.reference.name,
                style: {
                    font: {bold: true},
                    alignment: {textRotation: 45},
                },
            };
            return row;
        });

        rows.unshift(headerRow);

        return _.zip.apply(_, rows);
    },
    type = (function() {
        var classToType = {};
        'Boolean Number String Function Array Date RegExp Undefined Null'.split(' ')
          .forEach(function(d){classToType['[object ' + d + ']'] = d.toLowerCase();});
        return function(obj) {
            var strType = Object.prototype.toString.call(obj);
            return classToType[strType] || 'object';
        };
    })(),
    excel_datenum = function(v, date1904) {
        var epoch;
        if (date1904) v += 1462;
        epoch = Date.parse(v);
        return (epoch - new Date(Date.UTC(1899, 11, 30))) / (24 * 60 * 60 * 1000);
    },
    Workbook = function() {
        this.SheetNames = [];
        this.Sheets = {};
    },
    sheet_from_array_of_arrays = function(data) {
        var cell, cell_ref, i, j,
            ws = {},
            range = {
                s: {c: 10000000, r: 10000000},
                e: {c: 0, r: 0},
            };
        for (i = 0; i < data.length; i++) {
            for (j  = 0; j < data[i].length; j++) {
                if (range.s.r > i) range.s.r = i;
                if (range.s.c > j) range.s.c = j;
                if (range.e.r < i) range.e.r = i;
                if (range.e.c < j) range.e.c = j;
                cell = {v: data[i][j]};
                if (cell.v === null) continue;
                cell_ref = XLSX.utils.encode_cell({c: j, r: i});
                switch (type(cell.v)) {
                case 'number':
                    cell.t = 'n';
                    break;
                case 'boolean':
                    cell.t = 'b';
                    break;
                case 'date':
                    cell.t = 'n';
                    cell.z = XLSX.SSF._table[14];
                    cell.v = excel_datenum(cell.v);
                    break;
                case 'object':
                    cell.s = cell.v.style;
                    cell.t = 's';
                    cell.v = cell.v.value;
                    break;
                default:
                    cell.t = 's';
                }
                ws[cell_ref] = cell;
            }
        }
        if (range.s.c < 10000000) {
            ws['!ref'] = XLSX.utils.encode_range(range);
        }
        return ws;
    },
    writeXLSX = function(ws_name, data, ws_args){
        var wb = new Workbook(),
            ws = sheet_from_array_of_arrays(data);
        wb.SheetNames.push(ws_name);
        wb.Sheets[ws_name] = ws;
        if(ws_args){
            _.extend(ws, ws_args);
        }
        return XLSX.write(wb, {bookType: 'xlsx', bookSST: true, type: 'binary'});
    };


Meteor.methods({
    epiEvidenceDownload: function(tbl_id) {
        return writeXLSX('Epi evidence', EpiDescriptive.tabular(tbl_id));
    },
    epiMetaAnalysisDownload: function(json) {
        return writeXLSX('meta-analysis', EpiDescriptive.tabularMetaAnalysis(json));
    },
    ntpEpiEvidenceDownload: function(tbl_id) {
        return writeXLSX('Epi evidence', NtpEpiDescriptive.tabular(tbl_id));
    },
    ntpEpiVocDownload: function(tbl_id) {
        return writeXLSX('Variables of concern', NtpEpiConfounder.tabular(tbl_id));
    },
    ntpEpiRatingsDownload: function(tbl_id) {
        return writeXLSX('Confounders matrix', NtpEpiResult.tabularRatingsMatrix(tbl_id));
    },
    mechanisticEvidenceExcelDownload: function(tbl_id) {
        return writeXLSX('Mechanistic evidence', MechanisticEvidence.tabular(tbl_id));
    },
    exposureEvidenceDownload: function(tbl_id) {
        return writeXLSX('Exposure evidence', ExposureEvidence.tabular(tbl_id));
    },
    animalEvidenceDownload: function(tbl_id) {
        return writeXLSX('Bioassay evidence', AnimalEvidence.tabular(tbl_id));
    },
    ntpAnimalEvidenceDownload: function(tbl_id) {
        return writeXLSX('Bioassay evidence', NtpAnimalEvidence.tabular(tbl_id));
    },
    genotoxEvidenceDownload: function(tbl_id) {
        return writeXLSX('Genotoxicity evidence', GenotoxEvidence.tabular(tbl_id));
    },
    genotoxHumanExposureEvidenceDownload: function(tbl_id) {
        return writeXLSX('Genotoxicity-exposed Humans evidence', GenotoxHumanExposureEvidence.tabular(tbl_id));
    },
    referenceExcelDownload: function(monographAgent) {
        var wsName = monographAgent + '-references';
        return writeXLSX(wsName, Reference.tabular(monographAgent));
    },
    downloadExcelBiasWorksheet: function(collType, tbl_id) {
        let Coll = tblBuilderCollections.evidenceLookup[collType].collection,
            data = biasWorksheetExport(Coll, tbl_id);

        return writeXLSX('Bias', data);
    },
    downloadExcelBiasSummary: function(collType, tbl_id) {
        let Coll = tblBuilderCollections.evidenceLookup[collType].collection,
            data = biasWorksheetSummary(Coll, tbl_id),
            ws_args = {
                '!cols': [{wpx: 275}, undefined, {wpx: 500}],
                '!merges': [{s:{c:0, r:2}, e:{c:1, r:6}}],
            };
        return writeXLSX('Bias summary', data, ws_args);
    },
});
