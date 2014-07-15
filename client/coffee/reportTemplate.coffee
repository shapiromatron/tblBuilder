Session.setDefault('reportTemplateEditingId', null)
Session.set("reportTemplateShowNew", false)

# REPORT TEMPLATE MODAL --------------------------------------------------------
Template.reportTemplateModal.helpers
        getTemplateOptions : ->
            tblType = Session.get('Tbl').tblType
            templates = ReportTemplate.find({tblType: tblType}).fetch()
            return _.pluck(templates, 'filename')

Template.reportTemplateModal.events
    'click #download': (evt, tmpl) ->
        tbl_id = Session.get('Tbl')._id
        filename = tmpl.find('select[name="filename"] option:selected').value
        Meteor.call 'downloadWordReport', tbl_id, filename, (err, response) ->
            share.returnWordFile(response, "report.docx")

Template.reportTemplateModal.rendered = ->
    $(@.find('#reportTemplateModal')).modal('show')

    # completely remove self from DOM, including template
    $(@.find('#reportTemplateModal')).on 'hidden.bs.modal', =>
        @.__component__.dom.remove()

# REPORT TEMPLATE TABLE --------------------------------------------------------
Template.reportTemplateTable.helpers

    getReportTemplates: ->
        return ReportTemplate.find({}, {sort: [["tblType", 1], ["filename", 1]]})

    showNew: ->
        Session.get("reportTemplateShowNew")

    isEditing: ->
       return Session.get("reportTemplateEditingId") is @_id

Template.reportTemplateTable.events

    'click #show-create': (evt, tmpl) ->
        Session.set("reportTemplateShowNew", true)


# REPORT TEMPLATE ROW ----------------------------------------------------------
Template.reportTemplateRow.events
    'click #show-edit': (evt, tmpl) ->
        Session.set("reportTemplateEditingId", @_id)

    'click #downloadTemplate': (evt, tmpl) ->
        fn = @filename
        Meteor.call 'downloadTemplate', @._id, (err, response) ->
            share.returnWordFile(response, fn)

# REPORT TEMPLATE FORM ---------------------------------------------------------
Template.reportTemplateForm.helpers

    getTblTypeOptions: ->
        return tblTypeOptions

    isNew: ->
        return Session.get('reportTemplateEditingId') is null

getValues = (tmpl, methodName) ->
    errorDiv = tmpl.find("#errors")
    errorDiv.innerHTML = ""
    tblType = tmpl.find('select[name="tblType"]').value
    inp = tmpl.find('input[name="filename"]')
    if tmpl.data? then _id = tmpl.data._id
    if inp.files.length is 1
        fileReader = new FileReader()
        file = inp.files[0]
        fn = file.name
        fileReader.onload = (file) ->
            binaryData = file.srcElement.result
            Meteor.call methodName, binaryData, fn, tblType, _id, (err, res) ->
                if (err?)
                    msg = "#{err.reason}: #{err.details}"
                    setError(msg, errorDiv)
                else
                    Session.set("reportTemplateShowNew", false)
                    Session.set("reportTemplateEditingId", null)
        fileReader.readAsBinaryString(file)
    else
        msg = "Please load a Word template file."
        setError(msg, errorDiv)

Template.reportTemplateForm.events

    'click #create': (evt, tmpl) ->
        getValues(tmpl, 'saveNewTemplate')

    'click #update': (evt, tmpl) ->
        getValues(tmpl, 'updateExistingTemplate')

    'click #update-cancel': (evt, tmpl) ->
        Session.set("reportTemplateEditingId", null)

    'click #create-cancel': (evt, tmpl) ->
        Session.set("reportTemplateShowNew", false)

    'click #delete': (evt, tmpl) ->
        Meteor.call("removeExistingTemplate", @_id)
        Session.set("reportTemplateEditingId", null)

setError = (message, div) ->
    data = {
        alertType: "danger"
        message: message
    }
    rendered = UI.renderWithData(Template.dismissableAlert, data)
    UI.insert(rendered, div)
