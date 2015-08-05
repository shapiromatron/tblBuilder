Template.epiAnalysisMain.created = function() {
  this.subscribe('epiDescriptive', Session.get('Tbl')._id);
};


Template.epiAnalysisTbl.rendered = function() {
  var data = shared.getFlattenedEpiData(Session.get("Tbl")._id),
      tbl = $(this.find('#analysisTbl')),
      header = data.shift(); // drop header column

  var columns = _.map(header, function(field){
    return {
      "title": field,
      "visible": shared.defaultEpiVisible.indexOf(field) >= 0
    }
  });

  return tbl.dataTable({
    "lengthMenu": [[10, 25, 50, -1], [10, 25, 50, "All"]],
    "dom": 'RC<"clear">lfrtip',
    "scrollY": "600px",
    "scrollCollapse": true,
    "paging": false,
    "data": data,
    "columns": columns
  });

  $.extend($.fn.dataTableExt.oSort, {
    "authorYear-pre": function(s) {
      var res = s.match(/(\w+).*(\d{4})/);
      if (res != null) {
        return res[2] + " " + res[1];
      } else {
        return s;
      }
    },
    "authorYear-asc": function(a, b) {
      return ((a < b) ? -1 : ((a > b) ? 1 : 0));
    },
    "authorYear-desc": function(a, b) {
      return ((a < b) ? 1 : ((a > b) ?  -1 : 0));
    },
    "riskSort-pre": function(s) {
      var res = s.match(/([\d\.]+)/);
      return parseFloat(res[1]);
    },
    "riskSort-asc": function(a, b) {
      return ((a < b) ? -1 : ((a > b) ? 1 : 0));
    },
    "riskSort-desc": function(a, b) {
      return ((a < b) ? 1 : ((a > b) ?  -1 : 0));
    }
  });
};

