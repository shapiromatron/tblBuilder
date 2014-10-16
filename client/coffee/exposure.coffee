Session.setDefault('exposureShowNew', false)
Session.setDefault('exposureEditingId', null)
Session.setDefault('exposureShowAll', false)

# EXPOSURE TABLE ---------------------------------------------------------------
Template.exposureTbl.helpers
    showNew: ->
        Session.get("exposureShowNew")

    isEditing: ->
        Session.equals('exposureEditingId', @_id)

    getExposures: ->
        ExposureEvidence.find({}, {sort: {sortIdx: 1}})

    showRow: (isHidden) ->
        Session.get('exposureShowAll') or !isHidden

    isShowAll: ->
        Session.get('exposureShowAll')

Template.exposureTbl.events
    'click #show-create': (evt, tmpl) ->
        Session.set("exposureShowNew", true)
        Tracker.flush() # update DOM before focus
        share.activateInput(tmpl.find("input[name=referenceID]"))

    'click #downloadExcel': (evt, tmpl) ->
        tbl_id = Session.get('Tbl')._id
        Meteor.call 'exposureEvidenceDownload', tbl_id, (err, response) ->
            share.returnExcelFile(response, "exposure.xlsx")

    'click #toggleShowAllRows': (evt, tmpl) ->
        val = not Session.get('exposureShowAll')
        Session.set('exposureShowAll', val)

    'click #reorderRows': (evt, tmpl) ->
        val = not Session.get('reorderRows')
        Session.set('reorderRows', val)
        share.toggleRowVisibilty(Session.get('reorderRows'), $('.dragHandle'))

    'click #wordReport': (evt, tmpl) ->
        div = tmpl.find('#modalHolder')
        Blaze.renderWithData(Template.reportTemplateModal, {}, div)

    'click #toggleQAflags': (evt, tmpl) ->
        val = not Session.get('showQAflags')
        Session.set('showQAflags', val)

Template.exposureTbl.rendered = ->
    new Sortable(@.find('#sortable'),
        handle: ".dhOuter",
        onUpdate: share.moveRowCheck,
        Cls: ExposureEvidence )
    share.toggleRowVisibilty(Session.get('reorderRows'), $('.dragHandle'))


# EXPOSURE ROW -----------------------------------------------------------------
Template.exposureRow.events

    'click #toggle-hidden': (evt, tmpl) ->
        ExposureEvidence.update(@_id, {$set: {isHidden: !@isHidden}})

    'click #show-edit': (evt, tmpl) ->
        Session.set("exposureEditingId", @_id)
        Tracker.flush() # update DOM before focus
        share.activateInput($("input[name=referenceID]")[0])

    'click #copy-as-new': (evt, tmpl) ->
        Session.set("exposureShowNew", true)
        Tracker.flush() # update DOM before focus
        share.activateInput($("input[name=referenceID]")[0])
        share.copyAsNew(@)


# EXPOSURE FORM ----------------------------------------------------------------
Template.exposureForm.events
    'click #create': (evt, tmpl) ->
        obj = share.newValues(tmpl.find('#exposureForm'))
        obj['tbl_id'] = Session.get('Tbl')._id
        obj['sortIdx'] = 1e10  # temporary, make sure to place at bottom
        isValid = ExposureEvidence.simpleSchema().namedContext().validate(obj)
        if isValid
            ExposureEvidence.insert(obj)
            Session.set("exposureShowNew", false)
        else
            errorDiv = share.createErrorDiv(ExposureEvidence.simpleSchema().namedContext())
            $(tmpl.find("#errors")).html(errorDiv)

    'click #create-cancel': (evt, tmpl) ->
        Session.set("exposureShowNew", false)

    'click #update': (evt, tmpl) ->
        vals = share.updateValues(tmpl.find('#exposureForm'), @)
        # vals.studyDesign = tmpl.find('select[name="studyDesign"]').value  # add for conditional schema-logic
        modifier = {$set: vals}
        isValid = ExposureEvidence.simpleSchema().namedContext().validate(modifier, {modifier: true})
        if isValid
            ExposureEvidence.update(@_id, {$set: vals})
            Session.set("exposureEditingId", null)
        else
            errorDiv = share.createErrorDiv(ExposureEvidence.simpleSchema().namedContext())
            $(tmpl.find("#errors")).html(errorDiv)

    'click #update-cancel': (evt, tmpl) ->
        Session.set("exposureEditingId", null)

    'click #delete': (evt, tmpl) ->
        ExposureEvidence.remove(@_id)
        Session.set("exposureEditingId", null)

    'click #setQA,#unsetQA': (evt, tmpl) ->
        Meteor.call 'adminToggleQAd', this._id, "exposureEvidence", (err, response) ->
            if response then share.toggleQA(tmpl, response.QAd)

Template.exposureForm.rendered = ->
    share.toggleQA(@, @.data.isQA)
    $(@.findAll('.helpPopovers')).popover
            delay: {show: 500, hide: 100}
            trigger: "hover"
            placement: "auto"
