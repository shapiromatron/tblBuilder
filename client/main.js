Router.map(function () {
    this.route('my_lists', {path: '/'});
    this.route('in_vitro', {path: '/in_vitro'});
    // this.route('iv_tbl', {path: '/iv/:_id',
    //                       data: function() { return Posts.findOne(this.params._id); }});
    this.route('404', {path: '*'});
});
