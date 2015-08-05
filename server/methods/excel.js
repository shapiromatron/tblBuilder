var XLSX = Meteor.npmRequire('xlsx'),
    type = (function() {
      var classToType = {};
      "Boolean Number String Function Array Date RegExp Undefined Null".split(" ")
        .forEach(function(d){classToType["[object " + d + "]"] = d.toLowerCase();});
      return function(obj) {
        var strType = Object.prototype.toString.call(obj);
        return classToType[strType] || "object";
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
      var C, R, cell, cell_ref, i, j, range, ws;
      ws = {};
      range = {
        s: {c: 10000000, r: 10000000},
        e: {c: 0, r: 0}
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
            case "number":
              cell.t = 'n';
              break;
            case "boolean":
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
    };

Meteor.methods({
  epiEvidenceDownload: function(tbl_id) {
    var data, wb, ws, ws_name;
    data = shared.getFlattenedEpiData(tbl_id);
    ws_name = "epi Results";
    wb = new Workbook();
    ws = sheet_from_array_of_arrays(data);
    wb.SheetNames.push(ws_name);
    wb.Sheets[ws_name] = ws;
    return XLSX.write(wb, {bookType: 'xlsx', bookSST: true, type: 'binary'});
  },
  mechanisticEvidenceExcelDownload: function(tbl_id) {
    var data, getData, getDataRow, wb, ws, ws_name;
    getDataRow = function(v) {
      var refs = _.pluck(
        Reference.find({_id: {$in: v.references}}, {fields: {name: 1}}).fetch(),
        'name');
      return [
        v._id,
        v.section,
        v.parent,
        v.subheading || "",
        v.text || "",
        refs.join('; '),
        v.humanInVivo,
        v.humanInVitro,
        v.animalInVivo,
        v.animalInVitro
      ];
    };
    getData = function(tbl_id) {
      var addEvidence, data, header, i, section, sectionEvidences;
      header = [
        '_id',
        'section',
        'parent',
        'subheading',
        'text',
        'references',
        'humanInVivo',
        'humanInVitro',
        'animalInVivo',
        'animalInVitro'
      ];
      data = [header];
      addEvidence = function(evidence) {
        var children;
        data.push(getDataRow(evidence));
        children = MechanisticEvidence.find({parent: evidence._id}, {sort: {sortIdx: 1}});
        children.forEach(function(child) {addEvidence(child);});
      };
      MechanisticEvidence.evidenceSections.forEach(function(section){
        sectionEvidences = MechanisticEvidence.find(
          {tbl_id: tbl_id, section: section.section},
          {sort: {sortIdx: 1}}
        );
        sectionEvidences.forEach(function(evidence) {addEvidence(evidence);});
      });
      return data;
    };
    data = getData(tbl_id);
    ws_name = "mechanisticEvidence";
    wb = new Workbook();
    ws = sheet_from_array_of_arrays(data);
    wb.SheetNames.push(ws_name);
    wb.Sheets[ws_name] = ws;
    return XLSX.write(wb, {
      bookType: 'xlsx',
      bookSST: true,
      type: 'binary'
    });
  },
  exposureEvidenceDownload: function(tbl_id) {
    var data, wb, ws, ws_name;
    data = shared.getFlattenedExposureData(tbl_id);
    ws_name = "Exposure Results";
    wb = new Workbook();
    ws = sheet_from_array_of_arrays(data);
    wb.SheetNames.push(ws_name);
    wb.Sheets[ws_name] = ws;
    return XLSX.write(wb, {bookType: 'xlsx', bookSST: true, type: 'binary'});
  },
  animalEvidenceDownload: function(tbl_id) {
    var data, wb, ws, ws_name;
    data = shared.getFlattenedAnimalData(tbl_id);
    ws_name = "Bioassay Results";
    wb = new Workbook();
    ws = sheet_from_array_of_arrays(data);
    wb.SheetNames.push(ws_name);
    wb.Sheets[ws_name] = ws;
    return XLSX.write(wb, {bookType: 'xlsx', bookSST: true, type: 'binary'});
  },
  genotoxEvidenceDownload: function(tbl_id) {
    var data, wb, ws, ws_name;
    data = shared.getFlattenedGenotoxData(tbl_id);
    ws_name = "Genotoxicity Results";
    wb = new Workbook();
    ws = sheet_from_array_of_arrays(data);
    wb.SheetNames.push(ws_name);
    wb.Sheets[ws_name] = ws;
    return XLSX.write(wb, {bookType: 'xlsx', bookSST: true, type: 'binary'});
  },
  referenceExcelDownload: function(monographAgent) {
    var data, getData, getDataRow, wb, ws, ws_name;
    getDataRow = function(v) {
      return [v._id, v.name, v.fullCitation, v.referenceType, v.pubmedID, v.otherURL];
    };
    getData = function() {
      var data, header, i, ref, ref1, refs;
      header = ['_id', 'Short Citation', 'Full Citation', 'Reference Type', 'Pubmed ID', 'Other URL'];
      data = [header];
      refs = Reference.find({"monographAgent": {$in: [monographAgent]}}, {sort: [["name", 1]]}).fetch();
      refs.forEach(function(d){getDataRow(d)});
      return data;
    };
    data = getData();
    ws_name = monographAgent + "-references";
    wb = new Workbook();
    ws = sheet_from_array_of_arrays(data);
    wb.SheetNames.push(ws_name);
    wb.Sheets[ws_name] = ws;
    return XLSX.write(wb, {bookType: 'xlsx', bookSST: true, type: 'binary'});
  }
});
