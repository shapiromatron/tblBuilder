# Calculate trend-test and pairwise tests for an input dataset containing
# the incidence data in one vector and the number of animals in an second
# vector.
#
# Inputs and outputs from the `getStats` functions are strings in the
# JSON notation, for easier transport across languages.
#
# An example function-call may be:
#
# source("stats.R")
# inp = '{"ns":[10,10,10],"incs":[0,0,5]}'
# results = getStats(inp)
# lst = fromJSON(results)
#

library("rjson")
library("coin")

getTrendTest <- function(inp){

    ns <- as.integer(inp$ns)
    incs <- as.integer(inp$incs)
    nds <- ns-incs

    factors <- factor(seq(0, length(ns)-1))

    doses <-rep(factors, times=ns)
    responses <- rep(c(0,1), c(nds[1], incs[1]))
    for (i in 2:length(ns)){
        responses <- c(responses, rep(c(0,1), c(nds[i], incs[i])))
    }

    ds <- data.frame(
        dose = doses,
        responses = responses
    )

    res <- independence_test(responses~dose,
        data=ds,
        teststat="quad",
        distribution=approximate(B=50000))

    return(list(
       pvalue=pvalue(res, method="discrete")
   ))
}

getFischerTest <- function(inp){
    ns <- as.integer(inp$ns)
    incs <- as.integer(inp$incs)
    nds <- ns-incs
    m <- matrix(unlist(c(nds, incs)), ncol=2)

    pvalues = rep(NaN, length(ns))
    for (i in 2:length(ns)){
        dataset = matrix(c(m[1,], m[i,]), ncol=2)
        res <- fisher.test(dataset)
        pvalues[i] = res$p.value
    }
    return(list(
       pvalues=pvalues
    ))
}

getStats <- function(json){
    inps <- fromJSON(json)
    outputs <- list(
       inputs = inps,
       pairwise = getFischerTest(inps),
       trend = getTrendTest(inps)
    )
    return(toJSON(outputs))
}
