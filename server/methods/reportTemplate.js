var fs = Meteor.npmRequire('fs'),
    DocxGen = Meteor.npmRequire('docxtemplater'),
    cleanFilename = function(str) {
      return str.replace(/\.\./g, '').replace(/\//g, '');
    },
    saveFile = function(blob, fn) {
      var path = serverShared.getWordTemplatePath(fn);
      return fs.writeFile(path, blob, 'binary', function(err) {
        if (err) {
          console.log(path, err);
          throw new Meteor.Error(500, 'Failed to save file.', err);
        }
      });
    },
    removeFile = function(fn) {
      return fs.unlinkSync(fn);
    };

Meteor.methods({
  saveNewTemplate: function(blob, fn, tblType, epiSortOrder) {
    var dup;
    if (!serverShared.isStaffOrHigher(this.userId)) {
      throw new Meteor.Error(403, "Nice try wise-guy.");
    }
    fn = cleanFilename(fn);
    dup = ReportTemplate.findOne({filename: fn});
    if ((dup != null)) {
      throw new Meteor.Error(403, 'Failed to save file',
        'Duplicate filename. An existing report template has the same template name. Rename the current file.');
    }
    ReportTemplate.insert({
      filename: fn,
      tblType: tblType,
      epiSortOrder: epiSortOrder
    });
    return saveFile(blob, fn);
  },
  updateExistingTemplate: function(blob, fn, tblType, epiSortOrder, _id) {
    var dup;
    if (!serverShared.isStaffOrHigher(this.userId)) {
      throw new Meteor.Error(403, "Nice try wise-guy.");
    }
    fn = cleanFilename(fn);
    dup = ReportTemplate.findOne({filename: fn});
    if ((dup != null) && (dup._id !== _id)) {
      throw new Meteor.Error(403, 'Failed to save file',
        'Cannot overwrite template used for another report (change filename).');
    }
    ReportTemplate.update(_id, {
      filename: fn,
      tblType: tblType,
      epiSortOrder: epiSortOrder
    });
    return saveFile(blob, fn);
  },
  removeExistingTemplate: function(_id) {
    var obj, path;
    if (!serverShared.isStaffOrHigher(this.userId)) {
      throw new Meteor.Error(403, "Nice try wise-guy.");
    }
    obj = ReportTemplate.findOne(_id);
    path = serverShared.getWordTemplatePath(obj.filename);
    ReportTemplate.remove(_id);
    return removeFile(path);
  },
  downloadTemplate: function(_id) {
    var blob, docx, fn, path;
    if (!serverShared.isStaffOrHigher(this.userId)) {
      throw new Meteor.Error(403, "Nice try wise-guy.");
    }
    fn = ReportTemplate.findOne({_id: _id}).filename;
    path = serverShared.getWordTemplatePath(fn);
    blob = fs.readFileSync(path, "binary");
    docx = new DocxGen(blob);
    return docx.getZip().generate({type: "string"});
  }
});
