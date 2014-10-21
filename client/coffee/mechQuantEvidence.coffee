# MECH QUANT MAIN --------------------------------------------------------------
Template.mechQuantMain.rendered = ->
    Session.set('evidenceShowNew', false)
    Session.set('evidenceEditingId', null)
    Session.set('evidenceShowAll', false)


# MECH QUANT TABLE -------------------------------------------------------------
Template.mechQuantTbl.helpers

    showNew: ->
        Session.get("evidenceShowNew")

    isEditing: ->
        Session.equals('evidenceEditingId', @_id)

    showRow: (isHidden) ->
        Session.get('evidenceShowAll') or !isHidden

    isShowAll: ->
        Session.get('evidenceShowAll')

    object_list: ->
        MechQuantEvidence.find({}, {sort: {sortIdx: 1}})

Template.mechQuantTbl.events

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
        Meteor.call 'mechQuantEvidenceDownload', tbl_id, (err, response) ->
            share.returnExcelFile(response, "mechQuant.xlsx")

Template.mechQuantTbl.rendered = ->
    new Sortable(@.find('#sortable'),
        handle: ".dhOuter",
        onUpdate: share.moveRowCheck,
        Cls: MechQuantEvidence )
    share.toggleRowVisibilty(Session.get('reorderRows'), $('.dragHandle'))


# MECH QUANT ROW ---------------------------------------------------------------
Template.mechQuantRow.events

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
        MechQuantEvidence.update(@_id, {$set: {isHidden: !@isHidden}})


# MECH QUANT FORM --------------------------------------------------------------
Template.mechQuantForm.events

    'click #create-cancel': (evt, tmpl) ->
        Session.set("evidenceShowNew", false)

    'click #update-cancel': (evt, tmpl) ->
        Session.set("evidenceEditingId", null)

    'click #create': (evt, tmpl) ->
        obj = share.newValues(tmpl.find('#mechQuantForm'))
        obj['tbl_id'] = Session.get('Tbl')._id
        obj['sortIdx'] = 1e10  # temporary, make sure to place at bottom
        isValid = MechQuantEvidence.simpleSchema().namedContext().validate(obj)
        if isValid
            MechQuantEvidence.insert(obj)
            Session.set("evidenceShowNew", false)
        else
            errorDiv = share.createErrorDiv(MechQuantEvidence.simpleSchema().namedContext())
            $(tmpl.find("#errors")).html(errorDiv)

    'click #update': (evt, tmpl) ->
        vals = share.updateValues(tmpl.find('#mechQuantForm'), @)
        # vals.studyDesign = tmpl.find('select[name="studyDesign"]').value  # add for conditional schema-logic
        modifier = {$set: vals}
        isValid = MechQuantEvidence.simpleSchema().namedContext().validate(modifier, {modifier: true})
        if isValid
            MechQuantEvidence.update(@_id, {$set: vals})
            Session.set("evidenceEditingId", null)
        else
            errorDiv = share.createErrorDiv(MechQuantEvidence.simpleSchema().namedContext())
            $(tmpl.find("#errors")).html(errorDiv)

    'click #delete': (evt, tmpl) ->
        MechQuantEvidence.remove(@_id)
        Session.set("evidenceEditingId", null)

    'click #setQA,#unsetQA': (evt, tmpl) ->
        Meteor.call 'adminToggleQAd', this._id, "mechQuantEvidence", (err, response) ->
            if response then share.toggleQA(tmpl, response.QAd)

Template.mechQuantForm.rendered = ->
    share.toggleQA(@, @.data.isQA)
    $(@.findAll('.helpPopovers')).popover
            delay: {show: 500, hide: 100}
            trigger: "hover"
            placement: "auto"
