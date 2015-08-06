Template.reportTemplateModal.helpers({
  getTemplateOptions: function() {
    var tblType, templates;
    if (this.multiTable) {
      tblType = "Epidemiology Evidence";
    } else {
      tblType = Session.get('Tbl').tblType;
    }
    templates = ReportTemplate.find({tblType: tblType}).fetch();
    return _.pluck(templates, 'filename');
  }
});
Template.reportTemplateModal.events({
  'click #download': function(evt, tmpl) {
    var fn, tbl_id, templateFN;
    templateFN = tmpl.find('select[name="filename"] option:selected').value;
    if (this.multiTable) {
      this.templateFN = templateFN;
      fn = this.volumenumber + "-" + this.monographagent + ".docx";
      return Meteor.call('monographAgentEpiReport', this, function(err, response) {
        return clientShared.returnWordFile(response, fn);
      });
    } else {
      tbl_id = Session.get('Tbl')._id;
      return Meteor.call('downloadWordReport', tbl_id, templateFN, function(err, response) {
        return clientShared.returnWordFile(response, "report.docx");
      });
    }
  }
});
Template.reportTemplateModal.onRendered(function() {
  var self = this;
  $(this.find('#reportTemplateModal'))
    .on('hidden.bs.modal', function(){
      Blaze.remove(self.view);
      $(self.view._domrange.members).remove();
    }).modal('show');
});


Template.reportTemplateTable.helpers({
  getReportTemplates: function() {
    return ReportTemplate.find(
      {},
      {sort: [["tblType", 1], ["filename", 1]]});
  },
  showNew: function() {
    Session.get("reportTemplateShowNew");
  },
  isEditing: function() {
    Session.get("reportTemplateEditingId") === this._id;
  }
});
Template.reportTemplateTable.events({
  'click #show-create': function(evt, tmpl) {
    Session.set("reportTemplateShowNew", true);
  }
});


Template.reportTemplateRow.events({
  'click #show-edit': function(evt, tmpl) {
    Session.set("reportTemplateEditingId", this._id);
  },
  'click #downloadTemplate': function(evt, tmpl) {
    var fn = this.filename;
    Meteor.call('downloadTemplate', this._id, function(err, response) {
      clientShared.returnWordFile(response, fn);
    });
  }
});


var toggleEpiFields = function(tmpl) {
    var selector = tmpl.find('select[name="tblType"]'),
        type = $(selector).find('option:selected')[0].value;

    if (type === "Epidemiology Evidence") {
      return $(tmpl.findAll('.epiOnly')).show();
    } else {
      return $(tmpl.findAll('.epiOnly')).hide();
    }
  },
  getValues = function(tmpl, methodName) {
    var _id, file, fileReader, fn, msg,
      errorDiv = tmpl.find("#errors"),
      tblType = tmpl.find('select[name="tblType"]').value,
      epiSortOrder = tmpl.find('select[name="epiSortOrder"]').value,
      inp = tmpl.find('input[name="filename"]');

    if (tmpl.data != null) _id = tmpl.data._id;
    errorDiv.innerHTML = "";

    if (inp.files.length === 1) {
      fileReader = new FileReader();
      file = inp.files[0];
      fn = file.name;
      fileReader.onload = function(file) {
        var binaryData = file.srcElement.result;
        Meteor.call(methodName, binaryData, fn, tblType, epiSortOrder, _id, function(err, res) {
          var msg;
          if ((err != null)) {
            msg = err.reason + ": " + err.details;
            setError(msg, errorDiv);
          } else {
            Session.set("reportTemplateShowNew", false);
            Session.set("reportTemplateEditingId", null);
          }
        });
      };
      fileReader.readAsBinaryString(file);
    } else {
      msg = "Please load a Word template file.";
      setError(msg, errorDiv);
    }
  },
  setError = function(message, div) {
    var data = {
      alertType: "danger",
      message: message
    };
    return Blaze.renderWithData(Template.dismissableAlert, data, div);
  };
Template.reportTemplateForm.helpers({
  getTblTypeOptions: function() {
    return Tbls.typeOptions;
  },
  isNew: function() {
    return Session.get('reportTemplateEditingId') === null;
  },
  getEpiSortOrder: function() {
    return ["Reference", "Organ-site"];
  }
});
Template.reportTemplateForm.events({
  'click #create': function(evt, tmpl) {
    getValues(tmpl, 'saveNewTemplate');
  },
  'click #update': function(evt, tmpl) {
    getValues(tmpl, 'updateExistingTemplate');
  },
  'click #update-cancel': function(evt, tmpl) {
    Session.set("reportTemplateEditingId", null);
  },
  'click #create-cancel': function(evt, tmpl) {
    Session.set("reportTemplateShowNew", false);
  },
  'click #delete': function(evt, tmpl) {
    Meteor.call("removeExistingTemplate", this._id);
    Session.set("reportTemplateEditingId", null);
  },
  'change select[name="tblType"]': function(evt, tmpl) {
    toggleEpiFields(tmpl);
  }
});
Template.reportTemplateForm.onRendered(function() {
  toggleEpiFields(this);
});
