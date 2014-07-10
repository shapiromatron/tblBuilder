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
        console.log("AJS to implement")
        # Meteor.call('adminUserResetPassword', @_id)


# REPORT TEMPLATE FORM ---------------------------------------------------------
Template.reportTemplateForm.helpers

    getTblTypeOptions: ->
        return tblTypeOptions

    isNew: ->
        return Session.get('reportTemplateEditingId') is null

Template.reportTemplateForm.events

    'click #create': (evt, tmpl) ->
        # vals = getAdminUserValues(tmpl)
        # Meteor.call('adminUserCreateProfile', vals)
        console.log("AJS to implement")
        Session.set("reportTemplateShowNew", false)

    'click #update': (evt, tmpl) ->
        # vals = getAdminUserValues(tmpl)
        # Meteor.call('adminUserEditProfile', @_id, vals)
        console.log("AJS to implement")
        Session.set("reportTemplateEditingId", null)

    'click #update-cancel': (evt, tmpl) ->
        Session.set("reportTemplateEditingId", null)

    'click #create-cancel': (evt, tmpl) ->
        Session.set("reportTemplateShowNew", false)

    'click #delete': (evt, tmpl) ->
        console.log("AJS to implement")
        Session.set("reportTemplateEditingId", null)
