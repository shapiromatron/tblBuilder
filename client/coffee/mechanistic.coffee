Session.setDefault('mechanisticEditingId', null)
Session.setDefault('mechanisticNewChild', null)
Session.setDefault('mechanisticAllCollapsed', true)

initializeDraggable = (tmpl, options) ->
    id =  if options.isSection then tmpl.data.section else tmpl.data._id
    container = tmpl.find("#dragContainer_#{id}")
    if container
        new Sortable(container,
                draggable: ".dragObj_#{id}",
                handle: ".dragHandle_#{id}",
                onUpdate: share.moveRowCheck,
                Cls: MechanisticEvidence)
        share.toggleRowVisibilty(Session.get('reorderRows'), $('.dragHandle'))


Template.mechanisticMain.helpers
    isAllCollapsed: ->
        Session.get('mechanisticAllCollapsed')

Template.mechanisticMain.events
    'click #mechanistic-toggleShowAllRows': ->
        els = $('.accordianBody')
        if Session.get('mechanisticAllCollapsed') then els.collapse('show') else els.collapse('hide')
        Session.set('mechanisticAllCollapsed', not Session.get('mechanisticAllCollapsed'))

    'click #mechanistic-downloadExcel': (evt, tmpl) ->
        tbl_id = tmpl.data._id
        Meteor.call 'epiMechanisticEvidenceDownload', tbl_id, (err, response) ->
            share.returnExcelFile(response, "mechanisticEvidence.xlsx")

    'click #mechanistic-reorderRows': (evt, tmpl) ->
        Session.set('reorderRows', not Session.get('reorderRows'))
        share.toggleRowVisibilty(Session.get('reorderRows'), $('.dragHandle'))

Template.mechanisticMain.rendered = ->
    $(@.findAll('.collapse')).on 'show.bs.collapse', () ->
        $(@).parent().addClass('evidenceExpanded')
    $(@.findAll('.collapse')).on 'hide.bs.collapse', () ->
        $(@).parent().removeClass('evidenceExpanded')


Template.mechanisticTbl.helpers
    getMechanisticEvidenceSections: ->
        return mechanisticEvidenceSections


Template.mechanisticSectionTR.helpers
    getSectionEvidence: ->
        MechanisticEvidence.find({section: @section}, {sort: {sortIdx: 1}})

    displayNewSection: ->
        @section is Session.get('mechanisticEditingId')

    getDragContainer: ->
        return "dragContainer_#{@.section}"

Template.mechanisticSectionTR.events
    'click #mechanistic-newSection': (evt, tmpl) ->
        Session.set('mechanisticEditingId', @section)
        Deps.flush() # update DOM before focus
        share.activateInput(tmpl.find("textarea[name=text]"))

Template.mechanisticSectionTR.rendered = ->
    initializeDraggable(@, {isSection: true})


Template.mechanisticEvidenceDisplay.helpers
    displayEditingForm : ->
        Session.get("mechanisticEditingId") is @_id

    displayNewChild : ->
        Session.get('mechanisticNewChild') is @_id

    hasChildren : ->
        MechanisticEvidence.find({parent: @_id}).count()>0

    getChildren : ->
        MechanisticEvidence.find({parent: @_id}, {sort: {sortIdx: 1}})

    getDragContainer: ->
        return "dragContainer_#{@._id}"

    getDragHandleName: ->
        if (@section) then "dragHandle_#{@section}" else "dragHandle_#{@parent}"

    getDragObject: ->
        if (@section) then "dragObj_#{@section}" else "dragObj_#{@parent}"

Template.mechanisticEvidenceDisplay.events
    'click #mechanistic-show-edit': (evt, tmpl) ->
        Session.set("mechanisticEditingId", @_id)
        Deps.flush() # update DOM before focus
        share.activateInput(tmpl.find("textarea[name=text]"))

    'click #mechanistic-newChild': (evt, tmpl) ->
        Session.set("mechanisticNewChild", @_id)
        Deps.flush() # update DOM before focus
        share.activateInput(tmpl.find("textarea[name=text]"))

Template.mechanisticEvidenceDisplay.rendered = ->
    initializeDraggable(@, {isSection: false})


Template.mechanisticEvidenceForm.events
    'click #mechanisticEvidence-create': (evt, tmpl) ->
        obj = share.newValues(tmpl)
        obj['tbl_id'] = Session.get('Tbl')._id
        obj['section'] = @section
        obj['parent'] = @parent
        obj['sortIdx'] = 1e10  # temporary, make sure to place at bottom
        MechanisticEvidence.insert(obj)
        Session.set("mechanisticEditingId", null)
        Session.set('mechanisticNewChild', null)

    'click #mechanisticEvidence-create-cancel': (evt, tmpl) ->
        Session.set("mechanisticEditingId", null)
        Session.set('mechanisticNewChild', null)

    'click #mechanisticEvidence-update': (evt, tmpl) ->
        vals = share.updateValues(tmpl.find('#mechanisticEvidenceForm'), @)
        MechanisticEvidence.update(@_id, {$set: vals})
        Session.set("mechanisticEditingId", null)
        Session.set('mechanisticNewChild', null)

    'click #mechanisticEvidence-update-cancel': (evt, tmpl) ->
        Session.set("mechanisticEditingId", null)
        Session.set('mechanisticNewChild', null)

    'click #mechanisticEvidence-delete': (evt, tmpl) ->
        MechanisticEvidence.remove(@_id)
        Session.set("mechanisticEditingId", null)
        Session.set('mechanisticNewChild', null)

Template.mechanisticEvidenceForm.helpers
    displaySubheading : ->
        return @section?
