share.TablesHandler = null;
Deps.autorun ->
    share.TablesHandler = Meteor.subscribe('tables', Meteor.userId())

class TblRouterController extends RouteController

    data: ->
        return Tables.findOne(this.params._id)

    action: ->
        if @.ready()
            if Session.get('Tbl') is undefined then return @.render('404')
            @.render()
        else @.render("isLoading")

    onStop: ->
        Session.set('referenceMonographNumber', null)
        Session.set('Tbl', null)

Router.map ->

    this.route 'home',
        path: '/',

        waitOn: ->
            if share.TablesHandler.ready() then return

        action: ->
            if @.ready() then @.render() else @.render("isLoading")

    this.route 'epiCohortMain',
        path: '/epi-cohort/:_id'

        waitOn: ->
            if share.TablesHandler.ready()
                tbl = Tables.findOne({_id: this.params._id})
                Session.set('Tbl', tbl)
                if tbl
                    Session.set('referenceMonographNumber', tbl.monographNumber)
                    return Meteor.subscribe('epiCohort', tbl._id)

        controller: TblRouterController

    this.route 'epiCaseControlMain',
        path: '/epi-case-control/:_id'

        waitOn: ->
            if share.TablesHandler.ready()
                tbl = Tables.findOne({_id: this.params._id})
                Session.set('Tbl', tbl)
                if tbl
                    Session.set('referenceMonographNumber', tbl.monographNumber)
                    return Meteor.subscribe('epiCaseControl', tbl._id)

        controller: TblRouterController

    this.route 'mechanisticMain',
        path: '/mechanistic/:_id/',

        waitOn: ->
            if share.TablesHandler.ready()
                tbl = Tables.findOne({_id: this.params._id})
                Session.set('Tbl', tbl)
                if tbl
                    Session.set('referenceMonographNumber', tbl.monographNumber)
                    return Meteor.subscribe('mechanisticEvidence', tbl._id)

        controller: TblRouterController

    this.route 'referencesMain',
        path: '/monograph-:monographNumber/references/',

        data: ->
            return {monographNumber: this.params.monographNumber}

        waitOn: ->
            if share.TablesHandler.ready()
                monographNumber = parseInt(this.params.monographNumber, 10)
                Session.set('referenceMonographNumber', monographNumber)
                return Meteor.subscribe('monographReference', monographNumber)

        action: ->
            if @.ready() then @.render() else @.render("isLoading")

        onStop: ->
            Session.set('referenceMonographNumber', null)

    this.route 'referenceBatchUpload',
        path: '/monograph-:monographNumber/references/upload/',

        data: ->
            return {monographNumber: this.params.monographNumber}

        waitOn: ->
            if share.TablesHandler.ready()
                monographNumber = parseInt(this.params.monographNumber, 10)
                Session.set('referenceMonographNumber', monographNumber)
                return Meteor.subscribe('monographReference', monographNumber)

        action: ->
            if @.ready() then @.render() else @.render("isLoading")

        onStop: ->
            Session.set('referenceMonographNumber', null)

    this.route 'profileEdit',
        path: '/user-profile/'

    this.route 'isLoading',
        path: '/loading/'

    this.route '404'


Router.configure
    layoutTemplate: 'layout',
    notFoundTemplate: '404',
    loadingTemplate: 'isLoading'


Template._loginButtonsLoggedInDropdown.events
    'click #login-buttons-edit-profile': (event) ->
        event.stopPropagation()
        Template._loginButtons.toggleDropdown()
        Router.go('profileEdit')


###
Based on loading order issues, the following content must be kept int he "main"
module, despite it's preferred home being in a different location:
###

Template.selectList.helpers

    isSelected: (current, selected) ->
        return current is selected


UI.registerHelper "getUserDescription", ->
    if (@.profile and @.profile.fullName) then return @.profile.fullName
    return [(v.address for v in @.emails)].join(', ')


Template.typeaheadInput.helpers
    searchOrganSite: (qry, cb) ->
        Meteor.call "searchOrganSite", qry, (err, res) ->
            if err then return console.log(err)
            map = ({value: v} for v in res)
            cb(map)

    searchAgent: (qry, cb) ->
        Meteor.call "searchAgent", qry, (err, res) ->
            if err then return console.log(err)
            map = ({value: v} for v in res)
            cb(map)

Template.typeaheadInput.rendered = ->
    Meteor.typeahead.inject("input[name=#{@.data.name}]")

Template.typeaheadInput.destroyed = ->
    $(@.find("input[name=#{@.data.name}]")).unbind()



Template.typeaheadSelectList.helpers
    searchCovariates: (qry, cb) ->
        Meteor.call "searchCovariates", qry, (err, res) ->
            if err then return console.log(err)
            map = ({value: v} for v in res)
            cb(map)

Template.typeaheadSelectList.events

    'keyup .form-control': (evt, tmpl) ->
        if evt.which is 13
            val = evt.target.value
            $ul = $(tmpl.find('ul'))
            if share.typeaheadSelectListAddLI($ul, val)
                evt.target.value = ""

    'click .selectListRemove': (evt, tmpl) ->
        $(evt.currentTarget).parent().remove()

Template.typeaheadSelectList.rendered = ->
    Meteor.typeahead.inject("input[name=#{@.data.name}]")
    $ul = $(@.find('ul'))
    $(@.find("input")).on 'typeahead:selected', (e, v) ->
        share.typeaheadSelectListAddLI($ul, v.value)

Template.typeaheadSelectList.destroyed = ->
    $(@.find("input[name=#{@.data.name}]")).unbind()
