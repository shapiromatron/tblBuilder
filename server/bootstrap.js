// if the database is empty on server start, create some sample data.
var add_initial_data = function(){
    var references_data = [
      {"test_system": "S. typhimurium, TA98, TA100, TA1535, TA1537, TA1538",
      "substance_tested": "Petroleum-bitumen paints (n = 4): ",
      "result_without": "-",
      "comment": "No toxicity. Some of these paints were mouse-skin carcinogens",
      "reference": "Rusyn 2010",
      "result_with": "-",
      "_display": true},
      {"test_system": "S. typhimurium, TA98, TA100, TA1535, TA1537, TA1538",
      "substance_tested": "Petroleum-bitumen paints (n = 4): ",
      "result_without": "-",
      "result_with": "-",
      "comment": "No toxicity. Some of these paints were mouse-skin carcinogens",
      "reference": "Guyton 2011",
      "_display": false},
      {"test_system": "S. typhimurium, TA98, TA100, TA1535, TA1537, TA1538",
      "substance_tested": "Petroleum-bitumen paints (n = 4): ",
      "result_without": "-",
      "result_with": "-",
      "comment": "No toxicity. Some of these paints were mouse-skin carcinogens",
      "reference": "Shapiro 2012",
      "_display": true},
      {"test_system": "S. typhimurium, TA98, TA100, TA1535, TA1537, TA1538",
      "substance_tested": "Petroleum-bitumen paints (n = 4): ",
      "result_without": "-",
      "result_with": "-",
      "comment": "No toxicity. Some of these paints were mouse-skin carcinogens",
      "reference": "Guha 2013",
      "_display": true}
    ];

    var timestamp = (new Date()).getTime(),
    idx = 0;
    references_data.forEach(function (d){
      d['timestamp']=timestamp;
      d['_idx']=idx;
      Refs.insert(d);
        timestamp += 1; // ensure unique timestamp.
        idx += 1;
      });
  };

Meteor.startup(function () {
  if (Refs.find().count() === 0) add_initial_data();

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
    }
  });
});
