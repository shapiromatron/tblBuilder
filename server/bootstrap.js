// if the database is empty on server start, create some sample data.
Meteor.startup(function () {
  if (Refs.find().count() === 0) {
    var references_data = [
            {"test_system": "S. typhimurium, TA98, TA100, TA1535, TA1537, TA1538",
             "substance_tested": "Petroleum-bitumen paints (n = 4): ",
             "result_without": "-",
             "result_with": "-",
             "comment": "No toxicity. Some of these paints were mouse-skin carcinogens",
             "reference": "Guyton 2014"},
            {"test_system": "S. typhimurium, TA98, TA100, TA1535, TA1537, TA1538",
             "substance_tested": "Petroleum-bitumen paints (n = 4): ",
             "result_without": "-",
             "result_with": "-",
             "comment": "No toxicity. Some of these paints were mouse-skin carcinogens",
             "reference": "Guyton 2014"},
            {"test_system": "S. typhimurium, TA98, TA100, TA1535, TA1537, TA1538",
             "substance_tested": "Petroleum-bitumen paints (n = 4): ",
             "result_without": "-",
             "result_with": "-",
             "comment": "No toxicity. Some of these paints were mouse-skin carcinogens",
             "reference": "Guyton 2014"},
            {"test_system": "S. typhimurium, TA98, TA100, TA1535, TA1537, TA1538",
             "substance_tested": "Petroleum-bitumen paints (n = 4): ",
             "result_without": "-",
             "result_with": "-",
             "comment": "No toxicity. Some of these paints were mouse-skin carcinogens",
             "reference": "Guyton 2014"}
        ];

    var timestamp = (new Date()).getTime();
    references_data.forEach(function (d){
        d['timestamp']=timestamp
        Refs.insert(d)
        timestamp += 1; // ensure unique timestamp.
    });
  }
});
