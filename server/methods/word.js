var Future = Meteor.npmRequire('fibers/future'),
    PythonShell = Meteor.npmRequire('python-shell'),
    fs = Meteor.npmRequire('fs'),
    pyWordHelperArgs = function(report_type, context, fut) {
      var cb, options;
      options = {
        scriptPath: Meteor.settings.scripts_path,
        args: [report_type, JSON.stringify(context)],
        pythonPath: Meteor.settings.python_path
      };
      cb = function(err, res) {
        if (err) {
          console.log("An error occurred: ");
          console.log(err);
          return undefined;
        }
        return res.join("");
      };
      return PythonShell.run("generateReport.py", options, function(err, res) {
        return fut["return"](cb(err, res));
      });
    },
    pyWordHelperStdin = function(report_type, context, fut) {
      var report,
          options = {
              mode: "json",
              scriptPath: Meteor.settings.scripts_path,
              pythonPath: Meteor.settings.python_path
          },
          shell = new PythonShell("generateReport.py", options),
          inputs = {
              report_type: report_type,
              context: context
          };

      shell.on('message', function(msg) {
          return report = msg.report;
      });
      shell.send(inputs);
      return shell.end(function(err) {
        if (err) {
          process.stdout.write(err.traceback);
        }
        return fut["return"](report);
      });
    },
    getContext = function(report_type, tbl_id) {
      var d = null;
      switch (report_type) {
        case "ExposureTables":
          d = ExposureEvidence.wordContext(tbl_id);
          break;
        case "EpiDescriptiveTables":
          d = EpiDescriptive.wordContextByDescription([tbl_id]);
          break;
        case "EpiResultTables":
          d = EpiDescriptive.wordContextByResult([tbl_id]);
          break;
        case "EpiHtmlTables":
          d = EpiDescriptive.wordContextByDescription([tbl_id]);
          break;
        case "AnimalHtmlTables":
          d = AnimalEvidence.wordContext(tbl_id);
          break;
        case "GenotoxHtmlTables":
          d = GenotoxEvidence.wordContext(tbl_id);
          break;
        case "MechanisticEvidenceHtmlTables":
          d = MechanisticEvidence.wordContext(tbl_id);
          break;
        default:
          console.log("No context specified: {0}".printf(report_type));
      }
      return d;
    };


Meteor.methods({
  pyWordReport: function(tbl_id, report_type) {
    this.unblock();

    var context = getContext(report_type, tbl_id),
        fut = new Future();

    // exit early if we have no context
    if (_.isNull(context)) return;

    // else run python
    pyWordHelperStdin(report_type, context, fut);
    return fut.wait();
  }
});
