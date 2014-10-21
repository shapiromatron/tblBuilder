# GENOTOX MAIN -----------------------------------------------------------------
Template.genotoxMain.rendered = ->
    Session.set('evidenceShowNew', false)
    Session.set('evidenceEditingId', null)
    Session.set('evidenceShowAll', false)


# GENOTOX TABLE ----------------------------------------------------------------
Template.genotoxTbl.helpers

    showNew: ->
        Session.get("evidenceShowNew")

    isEditing: ->
        Session.equals('evidenceEditingId', @_id)

    showRow: (isHidden) ->
        Session.get('evidenceShowAll') or !isHidden

    isShowAll: ->
        Session.get('evidenceShowAll')

    object_list: ->
        GenotoxEvidence.find({}, {sort: {sortIdx: 1}})

Template.genotoxTbl.events

    'click #show-create': (evt, tmpl) ->
        Session.set("evidenceShowNew", true)
        Tracker.flush() # update DOM before focus
        share.activateInput(tmpl.find("input[name=referenceID]"))

    'click #toggleShowAllRows': (evt, tmpl) ->
        val = not Session.get('evidenceShowAll')
        Session.set('evidenceShowAll', val)

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

    'click #downloadExcel': (evt, tmpl) ->
        tbl_id = Session.get('Tbl')._id
        Meteor.call 'genotoxEvidenceDownload', tbl_id, (err, response) ->
            share.returnExcelFile(response, "genotox.xlsx")

Template.genotoxTbl.rendered = ->
    new Sortable(@.find('#sortable'),
        handle: ".dhOuter",
        onUpdate: share.moveRowCheck,
        Cls: GenotoxEvidence )
    share.toggleRowVisibilty(Session.get('reorderRows'), $('.dragHandle'))


# GENOTOX ROW ------------------------------------------------------------------
Template.genotoxRow.events

    'click #show-edit': (evt, tmpl) ->
        Session.set("evidenceEditingId", @_id)
        Tracker.flush() # update DOM before focus
        share.activateInput($("input[name=referenceID]")[0])

    'click #copy-as-new': (evt, tmpl) ->
        Session.set("evidenceShowNew", true)
        Tracker.flush() # update DOM before focus
        share.activateInput($("input[name=referenceID]")[0])
        share.copyAsNew(@)

    'click #toggle-hidden': (evt, tmpl) ->
        GenotoxEvidence.update(@_id, {$set: {isHidden: !@isHidden}})


# GENOTOX FORM -----------------------------------------------------------------
Template.genotoxForm.events

    'click #create-cancel': (evt, tmpl) ->
        Session.set("evidenceShowNew", false)

    'click #update-cancel': (evt, tmpl) ->
        Session.set("evidenceEditingId", null)

    'click #create': (evt, tmpl) ->
        obj = share.newValues(tmpl.find('#genotoxForm'))
        obj['tbl_id'] = Session.get('Tbl')._id
        obj['sortIdx'] = 1e10  # temporary, make sure to place at bottom
        isValid = GenotoxEvidence.simpleSchema().namedContext().validate(obj)
        if isValid
            GenotoxEvidence.insert(obj)
            Session.set("evidenceShowNew", false)
        else
            errorDiv = share.createErrorDiv(GenotoxEvidence.simpleSchema().namedContext())
            $(tmpl.find("#errors")).html(errorDiv)

    'click #update': (evt, tmpl) ->
        vals = share.updateValues(tmpl.find('#genotoxForm'), @)
        # vals.studyDesign = tmpl.find('select[name="studyDesign"]').value  # add for conditional schema-logic
        modifier = {$set: vals}
        isValid = GenotoxEvidence.simpleSchema().namedContext().validate(modifier, {modifier: true})
        if isValid
            GenotoxEvidence.update(@_id, {$set: vals})
            Session.set("evidenceEditingId", null)
        else
            errorDiv = share.createErrorDiv(GenotoxEvidence.simpleSchema().namedContext())
            $(tmpl.find("#errors")).html(errorDiv)

    'click #delete': (evt, tmpl) ->
        GenotoxEvidence.remove(@_id)
        Session.set("evidenceEditingId", null)

    'click #setQA,#unsetQA': (evt, tmpl) ->
        Meteor.call 'adminToggleQAd', this._id, "genotoxEvidence", (err, response) ->
            if response then share.toggleQA(tmpl, response.QAd)

Template.genotoxForm.rendered = ->
    share.toggleQA(@, @.data.isQA)
    $(@.findAll('.helpPopovers')).popover
            delay: {show: 500, hide: 100}
            trigger: "hover"
            placement: "auto"
