var XLSX = Meteor.npmRequire('xlsx'),
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
        var R, cell, cell_ref, i, j,
            ws = {},
            range = {
                s: {c: 10000000, r: 10000000},
                e: {c: 0, r: 0},
            };
        for (i = 0; i < data.length; i++) {
            R = data[i];
            for (j  = 0; j < R.length; j++) {
                C = R[j];
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
    writeXLSX = function(ws_name, data){
        var wb = new Workbook(),
            ws = sheet_from_array_of_arrays(data);
        wb.SheetNames.push(ws_name);
        wb.Sheets[ws_name] = ws;
        return XLSX.write(wb, {bookType: 'xlsx', bookSST: true, type: 'binary'});
    };


Meteor.methods({
    epiEvidenceDownload: function(tbl_id) {
        return writeXLSX('Epi evidence', EpiDescriptive.tabular(tbl_id));
    },
    epiMetaAnalysisDownload: function(json) {
        return writeXLSX('meta-analysis', EpiDescriptive.tabularMetaAnalysis(json));
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
    genotoxEvidenceDownload: function(tbl_id) {
        return writeXLSX('Genotoxicity evidence', GenotoxEvidence.tabular(tbl_id));
    },
    referenceExcelDownload: function(monographAgent) {
        var wsName = monographAgent + '-references';
        return writeXLSX(wsName, Reference.tabular(monographAgent));
    },
});
