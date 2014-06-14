Meteor.startup(function () {
  Meteor.methods({
    publish_workbook: function(ref_id){
      var XLSX = Meteor.require('xlsx');

      function datenum(v, date1904) {
        if(date1904) v+=1462;
        var epoch = Date.parse(v);
        return (epoch - new Date(Date.UTC(1899, 11, 30))) / (24 * 60 * 60 * 1000);
      }

      function sheet_from_array_of_arrays(data, opts) {
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
              cell.v = datenum(cell.v);
            }
            else cell.t = 's';

            ws[cell_ref] = cell;
          }
        }
        if(range.s.c < 10000000) ws['!ref'] = XLSX.utils.encode_range(range);
        return ws;
      }

      function Workbook() {
        if(!(this instanceof Workbook)) return new Workbook();
        this.SheetNames = [];
        this.Sheets = {};
      }

      var data = [[1,2,3],
                  [true, false, null, "sheetjs"],
                  ["foo","bar",new Date("2014-02-19T14:30Z"), "0.3"],
                  ["baz", null, "qux"]],
          ws_name = "SheetJS",
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
    epiCohortExposureNewIdx: function (epiCohort_id) {
      check(epiCohort_id, String);
      return getNewIdx(EpiCohortExposure, {"epiCohort_id": epiCohort_id});
    }
  });
});

var getNewIdx = function(Cls, filter){
  var max = -1,
      val = Cls.findOne(filter,
                        {fields: {"sortIdx":1, "_id":0},
                         sort:  {"sortIdx":-1}});
  if (val && isFinite(val.sortIdx)) max = val.sortIdx;
  return max+1;
};
