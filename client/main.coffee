Deps.autorun ->
    Meteor.subscribe 'myTbls', Meteor.userId()


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

    this.route 'my_lists',
        path: '/',

        waitOn: ->
            return Meteor.subscribe('myTbls', Meteor.userId())

        action: ->
            if @.ready() then @.render()

    this.route 'epiCohortMain',
        path: '/epi-cohort/:_id'

        data: ->
            return MyTbls.findOne(this.params._id)

        waitOn: ->
            @.subscribe('myTbls', Meteor.userId()).wait()
            if @.ready()
                tbl = MyTbls.findOne({_id: this.params._id})
                permissionsCheck(tbl)
                Session.set('MyTbl', tbl)
                return Meteor.subscribe('epiCohort', tbl._id)

        action: ->
            if @.ready() then @.render()

    this.route 'epiCaseControlMain',
        path: '/epi-case-control/:_id',

        data: ->
            return MyTbls.findOne(this.params._id)

        waitOn: ->
            @.subscribe('myTbls', Meteor.userId()).wait()
            if @.ready()
                tbl = MyTbls.findOne({_id: this.params._id})
                permissionsCheck(tbl)
                Session.set('MyTbl', tbl)
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
