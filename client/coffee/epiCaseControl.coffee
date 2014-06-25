Session.setDefault('epiCaseControlShowNew', false)
Session.setDefault('epiCaseControlEditingId', null)
Session.setDefault('epiCaseControlShowAll', false)
Session.setDefault('epiRiskShowPlots', false)


Template.epiCaseControlTbl.helpers

    getEpiCaseControls: ->
        EpiCaseControl.find({}, {sort: {sortIdx: 1}})

    epiCaseControlShowNew: ->
        Session.get("epiCaseControlShowNew")

    epiCaseControlIsEditing: ->
        Session.equals('epiCaseControlEditingId', @_id)

    showRow: (isHidden) ->
        Session.get('epiCaseControlShowAll') or !isHidden

    isShowAll: ->
        Session.get('epiCaseControlShowAll')

    showPlots: ->
        Session.get('epiRiskShowPlots')


Template.epiCaseControlTbl.events
    'click #epiCaseControl-show-create': (evt, tmpl) ->
        Session.set("epiCaseControlShowNew", true)
        Deps.flush() # update DOM before focus
        share.activateInput(tmpl.find("input[name=referenceID]"))

    'click #epiCaseControl-show-edit': (evt, tmpl) ->
        Session.set("epiCaseControlEditingId", @_id)
        Deps.flush() # update DOM before focus
        share.activateInput(tmpl.find("input[name=referenceID]"))

    'click #epiCaseControl-move-up': (evt, tmpl) ->
        tr = $(tmpl.find('tr[data-id=' + @_id + ']'))
        share.moveRow(this, tr, EpiCaseControl, true)

    'click #epiCaseControl-move-down': (evt, tmpl) ->
        tr = $(tmpl.find('tr[data-id=' + @_id + ']'))
        share.moveRow(this, tr, EpiCaseControl, false)

    'click #epiCaseControl-downloadExcel': (evt, tmpl) ->
        tbl_id = tmpl.data._id
        Meteor.call('epiCaseControlDownload', tbl_id, (err, response) ->
            share.returnExcelFile(response, "epiCaseControl.xlsx")
        )
    'click #epiCaseControl-toggleShowAllRows': (evt, tmpl) ->
        val = !Session.get('epiCaseControlShowAll')
        Session.set('epiCaseControlShowAll', val)
        Session.set('epiRiskShowAll', val)

    'click #epiCaseControl-toggle-hidden': (evt, tmpl) ->
        EpiCaseControl.update(@_id, {$set: {isHidden: !@isHidden}})

    'click #epiCaseControl-copy-as-new': (evt, tmpl) ->
        Session.set("epiCaseControlShowNew", true)
        Deps.flush() # update DOM before focus
        share.activateInput(tmpl.find("input[name=referenceID]"))
        share.copyAsNew(@)

    'click #epiCaseControl-epiRiskShowPlots': (evt, tmpl) ->
        Session.set('epiRiskShowPlots', not Session.get('epiRiskShowPlots'))
        share.toggleRiskPlot()

Template.epiCaseControlTbl.rendered = ->
        share.toggleRiskPlot()


Template.epiCaseControlForm.helpers
    "epiCaseControlIsNew":
        (val)-> val is "T"


Template.epiCaseControlForm.events
    'click #epiCaseControl-create': (evt, tmpl) ->
        obj = share.newValues(tmpl)
        obj['timestamp'] = (new Date()).getTime()
        obj['user_id'] = Meteor.userId()
        obj['tbl_id'] = Session.get('Tbl')._id
        obj['isHidden'] = false
        Meteor.call('epiCaseControlNewIdx', obj['tbl_id'], (err, response) ->
            obj['sortIdx'] = response
            EpiCaseControl.insert(obj)
            Session.set("epiCaseControlShowNew", false)
        )
    'click #epiCaseControl-create-cancel': (evt, tmpl) ->
        Session.set("epiCaseControlShowNew", false)

    'click #epiCaseControl-update': (evt, tmpl) ->
        vals = share.updateValues(tmpl.find('#epiCaseControlForm'), @)
        EpiCaseControl.update(@_id, {$set: vals})
        Session.set("epiCaseControlEditingId", null)

    'click #epiCaseControl-update-cancel': (evt, tmpl) ->
        Session.set("epiCaseControlEditingId", null)

    'click #epiCaseControl-delete': (evt, tmpl) ->
        EpiCaseControl.remove(@_id)
        Session.set("epiCaseControlEditingId", null)
