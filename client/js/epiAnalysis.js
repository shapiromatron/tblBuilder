Template.epiAnalysisMain.onCreated(function() {
    this.subscribe('epiDescriptive', Session.get('Tbl')._id);
});


Template.epiAnalysisTbl.onRendered(function() {
    var data = EpiDescriptive.tabular(Session.get("Tbl")._id),
        tbl = $(this.find('#analysisTbl')),
        header = data.shift(), // drop header column
        columns = _.map(header, function(field){
            return {
                "title": field,
                "visible": _.contains(EpiDescriptive.defaultAnalysisVisible, field),
            };
        });

    tbl.dataTable({
        "lengthMenu": [[10, 25, 50, -1], [10, 25, 50, "All"]],
        "dom": 'RC<"clear">lfrtip',
        "scrollY": "600px",
        "scrollCollapse": true,
        "paging": false,
        "data": data,
        "columns": columns,
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
        },
    });
});
