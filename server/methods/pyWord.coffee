Future = Meteor.npmRequire('fibers/future')
zerorpc = Meteor.npmRequire("zerorpc");

client = undefined
Meteor.startup ->
    client = new zerorpc.Client({"timeout": 60})
    client.connect("tcp://127.0.0.1:4242")

Meteor.methods

    pyWordReport: (tbl_id) ->
        @unblock()
        tbl_data = JSON.stringify({title: "jazz"})
        fut = new Future()
        client.invoke "createReport", tbl_data, (error, res, more) ->
            fut.return(res)
        return fut.wait()
