fs = Meteor.npmRequire('fs')
DocxGen = Meteor.npmRequire('docxtemplater')


cleanFilename = (str) ->
    return str.replace(/\.\./g,'').replace(/\//g,'')

saveFile = (blob, fn) ->
    # help from:  https://gist.github.com/dariocravero/3922137
    path = share.getWordTemplatePath(fn)
    fs.writeFile path, blob, 'binary', (err) ->
        if (err)
            console.log(path, err)
            throw new Meteor.Error(500, 'Failed to save file.', err)

removeFile = (fn) ->
    fs.unlinkSync(fn)


Meteor.methods

    saveNewTemplate: (blob, fn, tblType, epiSortOrder) ->
        unless share.isStaffOrHigher(this.userId)
            throw new Meteor.Error(403, "Nice try wise-guy.")
        fn = cleanFilename(fn)

        # Filename must be unique check
        dup = ReportTemplate.findOne({filename: fn})
        if (dup?)
            throw new Meteor.Error(403, 'Failed to save file',
                                   'Duplicate filename. An existing report template has the same template name. Rename the current file.')

        ReportTemplate.insert({filename: fn, tblType: tblType, epiSortOrder: epiSortOrder})
        saveFile(blob, fn)

    updateExistingTemplate: (blob, fn, tblType, epiSortOrder, _id) ->
        unless share.isStaffOrHigher(this.userId)
            throw new Meteor.Error(403, "Nice try wise-guy.")
        fn = cleanFilename(fn)

        # make sure we're not overwriting another template
        dup = ReportTemplate.findOne({filename: fn})
        if ((dup?) and (dup._id isnt _id))
            throw new Meteor.Error(403, 'Failed to save file',
                                   'Cannot overwrite template used for another report (change filename).')

        ReportTemplate.update(_id, {filename: fn, tblType: tblType, epiSortOrder: epiSortOrder})
        saveFile(blob, fn)

    removeExistingTemplate: (_id) ->
        unless share.isStaffOrHigher(this.userId)
            throw new Meteor.Error(403, "Nice try wise-guy.")
        obj = ReportTemplate.findOne(_id)
        path = share.getWordTemplatePath(obj.filename)
        ReportTemplate.remove(_id)
        removeFile(path)

    downloadTemplate: (_id) ->
        unless share.isStaffOrHigher(this.userId)
            throw new Meteor.Error(403, "Nice try wise-guy.")
        fn = ReportTemplate.findOne({_id: _id}).filename
        path = share.getWordTemplatePath(fn)
        blob = fs.readFileSync(path, "binary")
        docx = new DocxGen(blob)
        return docx.getZip().generate({type: "string"})
