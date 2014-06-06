// if the database is empty on server start, create some sample data.
Meteor.startup(function () {
  if (Refs.find().count() === 0) {
    var references_data = [
            {"citation": "Guyton 2014"},
            {"citation": "Guha 2014"},
            {"citation": "Smith 2014"},
            {"citation": "Shapiro 2014"}
        ];

    var timestamp = (new Date()).getTime();
    references_data.forEach(function (d){
        Refs.insert({
            citation: d.citation,
            timestamp: timestamp
        })
        timestamp += 1; // ensure unique timestamp.
    });
  }
});
