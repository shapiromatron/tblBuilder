var XLSX = Meteor.require('xlsx'),
  excel_datenum = function(v, date1904) {
    if(date1904) v+=1462;
    var epoch = Date.parse(v);
    return (epoch - new Date(Date.UTC(1899, 11, 30))) / (24 * 60 * 60 * 1000);
  },
  Workbook = function() {
    if(!(this instanceof Workbook)) return new Workbook();
    this.SheetNames = [];
    this.Sheets = {};
  },
  sheet_from_array_of_arrays = function(data) {
    var ws = {};
    var range = {s: {c:10000000, r:10000000}, e: {c:0, r:0 }};
    for(var R = 0; R != data.length; ++R) {
      for(var C = 0; C != data[R].length; ++C) {
        if(range.s.r > R) range.s.r = R;
        if(range.s.c > C) range.s.c = C;
        if(range.e.r < R) range.e.r = R;
        if(range.e.c < C) range.e.c = C;
        var cell = {v: data[R][C] };
        if(cell.v === null) continue;
        var cell_ref = XLSX.utils.encode_cell({c:C,r:R});

        if(typeof cell.v === 'number') cell.t = 'n';
        else if(typeof cell.v === 'boolean') cell.t = 'b';
        else if(cell.v instanceof Date) {
          cell.t = 'n'; cell.z = XLSX.SSF._table[14];
          cell.v = excel_datenum(cell.v);
        }
        else cell.t = 's';

        ws[cell_ref] = cell;
      }
    }
    if(range.s.c < 10000000) ws['!ref'] = XLSX.utils.encode_range(range);
    return ws;
  },
  getNewIdx = function(Cls, filter){
    var max = -1,
        val = Cls.findOne(filter,
                          {fields: {"sortIdx":1, "_id":0},
                           sort:  {"sortIdx":-1}});
    if (val && isFinite(val.sortIdx)) max = val.sortIdx;
    return max+1;
  };

Meteor.methods({
  epiCohortDownload: function(myTbl_id){
    var getEpiCohortData = function(myTbl_id){
        cohorts = EpiCohort.find({myTbl_id: myTbl_id}, {sort: {sortIdx: 1}});
        var data = [['reference', 'location', 'followUpPeriod',
                     'numSubjects', 'numSubjectsDetails', 'covariates',
                     'comments', 'isHiddenCohort', 'organSite',
                     'exposureCategories', 'exposedCases', 'riskMid',
                     'riskLow', 'riskHigh', 'riskEstimated',
                     'isHiddenCohortExposure']];
        cohorts.forEach(function(v){
          var row = [v.reference, v.location, v.followUpPeriod,
                     v.numSubjects, v.numSubjectsText, v.covariates,
                     v.comments, v.isHidden],
              rows = getEpiRiskEstimateData(v._id, row);
          data.push.apply(data, rows);
        });
        return data;
      },
      getEpiRiskEstimateData = function(epiCohort_id, row_arr){
        var exposures = EpiRiskEstimate.find({epiCohort_id: epiCohort_id}, {sort: {sortIdx: 1}}),
            rows = [];
        exposures.forEach(function(v){
          var new_row = row_arr.slice();
          new_row.push(v.organSite, v.exposureCategories, v.exposedCases,
                       v.riskMid, v.riskLow, v.riskHigh,
                       v.riskEstimated, v.isHidden);
          rows.push(new_row);
        });
        return rows;
      },
      data = getEpiCohortData(myTbl_id),
      ws_name = "epiCohort",
      wb = new Workbook(),
      ws = sheet_from_array_of_arrays(data);

    /* add worksheet to workbook */
    wb.SheetNames.push(ws_name);
    wb.Sheets[ws_name] = ws;
    var wbout = XLSX.write(wb, {bookType:'xlsx', bookSST:true, type: 'binary'});
    return wbout;
  },
  epiCohortNewIdx: function (myTbl_id) {
    check(myTbl_id, String);
    return getNewIdx(EpiCohort, {"myTbl_id": myTbl_id});
  },
  epiRiskEstimateNewIdx: function (parent_id) {
    check(parent_id, String);
    return getNewIdx(EpiRiskEstimate, {"parent_id": parent_id});
  },
  epiCaseControlNewIdx: function (myTbl_id) {
    check(myTbl_id, String);
    return getNewIdx(EpiCaseControl, {"myTbl_id": myTbl_id});
  },
});
