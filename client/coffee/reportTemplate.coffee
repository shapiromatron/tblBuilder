Template.reportTemplateModal.rendered = ->
    $(@.find('#reportTemplateModal')).modal('show')

    # completely remove self from DOM, including template
    $(@.find('#reportTemplateModal')).on 'hidden.bs.modal', =>
        @.__component__.dom.remove()

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
