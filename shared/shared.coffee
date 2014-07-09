
share.riskFormatter = (obj) ->
    txt = obj.riskMid.toString()
    if (obj.riskLow and obj.riskHigh)
        txt += " (#{obj.riskLow}-#{obj.riskHigh})"
    if obj.riskEstimated then txt = "[#{txt}]"
    return txt
