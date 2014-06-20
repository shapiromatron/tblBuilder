Deps.autorun ->
    Meteor.subscribe 'tables', Meteor.userId()


permissionsCheck = (tbl) ->

    userCanView = (tbl) ->
        # check to ensure that the current user is both authenticated and part of
        # the project team before allowing to view
        user = Meteor.user()
        if(tbl and user)
            id = user._id
            valid_ids = (v.user_id for v in tbl.user_roles)
            return ((id is tbl.user_id) or (valid_ids.indexOf(id)>=0))
        return false

    if not tbl?
        Router.go('404')
        return false
    if(userCanView(tbl)) then return true else Router.go('403')
    return false

Router.map ->

    this.route 'home',
        path: '/',

        waitOn: ->
            return Meteor.subscribe('tables', Meteor.userId())

        action: ->
            if @.ready() then @.render()

    this.route 'epiCohortMain',
        path: '/epi-cohort/:_id'

        data: ->
            return Tables.findOne(this.params._id)

        waitOn: ->
            @.subscribe('tables', Meteor.userId()).wait()
            if @.ready()
                tbl = Tables.findOne({_id: this.params._id})
                permissionsCheck(tbl)
                Session.set('Tbl', tbl)
                return Meteor.subscribe('epiCohort', tbl._id)

        action: ->
            if @.ready() then @.render()

    this.route 'epiCaseControlMain',
        path: '/epi-case-control/:_id',

        data: ->
            return Tables.findOne(this.params._id)

        waitOn: ->
            @.subscribe('tables', Meteor.userId()).wait()
            if @.ready()
                tbl = Tables.findOne({_id: this.params._id})
                permissionsCheck(tbl)
                Session.set('Tbl', tbl)
                return Meteor.subscribe('epiCaseControl', tbl._id)

        action: ->
            if @.ready() then @.render()

    this.route 'profileEdit',
        path: '/user-profile/'

    this.route 'isLoading',
        path: '/loading/'

    this.route '403'

    this.route '404'


Router.configure
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
            if err
                return console.log(err)
            map = ({value: v} for v in res)
            cb(map)

Template.typeaheadInput.rendered = ->
    Meteor.typeahead.inject("input[name=#{@.data.name}]")

Template.typeaheadInput.destroyed = ->
    $(@.find("input[name=#{@.data.name}]")).unbind()
