Session.setDefault('epiCohortShowNew', false)
Session.setDefault('epiCohortEditingId', null)
Session.setDefault('epiCohortShowAll', false)


Template.epiCohortTbl.helpers

    getEpiCohorts: ->
        EpiCohort.find({}, {sort: {sortIdx: 1}})

    epiCohortShowNew: ->
        Session.get("epiCohortShowNew")

    epiCohortIsEditing: ->
        Session.equals('epiCohortEditingId', @_id)

    showRow: (isHidden) ->
        Session.get('epiCohortShowAll') or !isHidden

    isShowAll: ->
        Session.get('epiCohortShowAll')

    showPlots: ->
        Session.get('epiRiskShowPlots')


Template.epiCohortTbl.events
    'click #epiCohort-show-create': (evt, tmpl) ->
        Session.set("epiCohortShowNew", true)
        Deps.flush() # update DOM before focus
        share.activateInput(tmpl.find("input[name=referenceID]"))

    'click #epiCohort-show-edit': (evt, tmpl) ->
        Session.set("epiCohortEditingId", @_id)
        Deps.flush() # update DOM before focus
        share.activateInput(tmpl.find("input[name=referenceID]"))

    'click #epiCohort-downloadExcel': (evt, tmpl) ->
        tbl_id = tmpl.data._id
        Meteor.call 'epiCohortExcelDownload', tbl_id, (err, response) ->
            share.returnExcelFile(response, "epiCohort.xlsx")

    'click #epiCohort-toggleShowAllRows': (evt, tmpl) ->
        val = !Session.get('epiCohortShowAll')
        Session.set('epiCohortShowAll', val)
        Session.set('epiRiskShowAll', val)

    'click #epiCohort-toggle-hidden': (evt, tmpl) ->
        EpiCohort.update(@_id, {$set: {isHidden: !@isHidden}})

    'click #epiCohort-copy-as-new': (evt, tmpl) ->
        Session.set("epiCohortShowNew", true)
        Deps.flush() # update DOM before focus
        share.activateInput(tmpl.find("input[name=referenceID]"))
        share.copyAsNew(@)

    'click #epiCohort-epiRiskShowPlots': (evt, tmpl) ->
        Session.set('epiRiskShowPlots', not Session.get('epiRiskShowPlots'))
        share.toggleRiskPlot()

    'click #epiCohort-reorderRows': (evt, tmpl) ->
        Session.set('reorderRows', not Session.get('reorderRows'))
        share.toggleRowVisibilty(Session.get('reorderRows'), $('.dragHandle'))

Template.epiCohortTbl.rendered = ->
    share.toggleRiskPlot()
    new Sortable(@.find('#sortable'),
        handle: ".dhOuter",
        onUpdate: share.moveRowCheck,
        Cls: EpiCohort )
    share.toggleRowVisibilty(Session.get('reorderRows'), $('.dragHandle'))

Template.epiCohortForm.events
    'click #epiCohort-create': (evt, tmpl) ->
        obj = share.newValues(tmpl)
        obj['tbl_id'] = Session.get('Tbl')._id
        obj['sortIdx'] = 1e10  # temporary, make sure to place at bottom
        EpiCohort.insert(obj)
        Session.set("epiCohortShowNew", false)

    'click #epiCohort-create-cancel': (evt, tmpl) ->
        Session.set("epiCohortShowNew", false)

    'click #epiCohort-update': (evt, tmpl) ->
        vals = share.updateValues(tmpl.find('#epiCohortForm'), @)
        EpiCohort.update(@_id, {$set: vals})
        Session.set("epiCohortEditingId", null)

    'click #epiCohort-update-cancel': (evt, tmpl) ->
        Session.set("epiCohortEditingId", null)

    'click #epiCohort-delete': (evt, tmpl) ->
        EpiCohort.remove(@_id)
        Session.set("epiCohortEditingId", null)
