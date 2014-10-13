Session.setDefault('reportTemplateEditingId', null)
Session.set("reportTemplateShowNew", false)

# REPORT TEMPLATE MODAL --------------------------------------------------------
Template.reportTemplateModal.helpers
    getTemplateOptions : ->
        if @multiTable
            tblType = "Epidemiology Evidence"
        else
            tblType = Session.get('Tbl').tblType
        templates = ReportTemplate.find({tblType: tblType}).fetch()
        return _.pluck(templates, 'filename')

Template.reportTemplateModal.events
    'click #download': (evt, tmpl) ->
        templateFN = tmpl.find('select[name="filename"] option:selected').value
        if @multiTable
            @templateFN = templateFN
            fn = "#{@volumenumber}-#{@monographagent}.docx"
            Meteor.call 'monographAgentEpiReport', @, (err, response) ->
                share.returnWordFile(response, fn)

        else
            tbl_id = Session.get('Tbl')._id
            Meteor.call 'downloadWordReport', tbl_id, templateFN, (err, response) ->
                share.returnWordFile(response, "report.docx")

Template.reportTemplateModal.rendered = ->
    $(@.find('#reportTemplateModal')).modal('show')

    # completely remove self from DOM, including template
    $(@.find('#reportTemplateModal')).on 'hidden.bs.modal', =>
        Blaze.remove(@.view)
        $(@.view._domrange.members).remove()

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

    getEpiSortOrder: ->
        return ["Reference", "Organ-site"]

toggleEpiFields = (tmpl) ->
    # Required-input only if epidemiological study
    selector = tmpl.find('select[name="tblType"]')
    type = $(selector).find('option:selected')[0].value
    if type is "Epidemiology Evidence"
        $(tmpl.findAll('.epiOnly')).show()
    else
        $(tmpl.findAll('.epiOnly')).hide()

getValues = (tmpl, methodName) ->
    errorDiv = tmpl.find("#errors")
    errorDiv.innerHTML = ""
    tblType = tmpl.find('select[name="tblType"]').value
    epiSortOrder = tmpl.find('select[name="epiSortOrder"]').value
    inp = tmpl.find('input[name="filename"]')
    if tmpl.data? then _id = tmpl.data._id
    if inp.files.length is 1
        fileReader = new FileReader()
        file = inp.files[0]
        fn = file.name
        fileReader.onload = (file) ->
            binaryData = file.srcElement.result
            Meteor.call methodName, binaryData, fn, tblType, epiSortOrder, _id, (err, res) ->
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

    'change select[name="tblType"]': (evt, tmpl) ->
        toggleEpiFields(tmpl)

Template.reportTemplateForm.rendered = ->
    toggleEpiFields(@)

setError = (message, div) ->
    data = {
        alertType: "danger"
        message: message
    }
    Blaze.renderWithData(Template.dismissableAlert, data, div)
