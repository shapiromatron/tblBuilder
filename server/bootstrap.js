// if the database is empty on server start, create some sample data.
Meteor.startup(function () {
  if (Refs.find().count() === 0) {
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
  }
});
