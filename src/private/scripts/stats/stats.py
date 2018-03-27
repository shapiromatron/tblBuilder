import json
import os
import sys

from rpy2.robjects import r, globalenv


r_code = os.path.abspath(
    os.path.join(os.path.dirname(__file__), 'stats.R'))


def calculate_stats(data):
    with open(r_code) as f:
        txt = f.read()
    r(txt)
    get_stats = globalenv['get_stats']
    res = get_stats(data)
    return res[0]


def is_close(exp, target, tol=1e-4):
    # floating-point precision
    return abs(target - exp) < tol


def test_calculate_stats():
    res = json.loads(calculate_stats('{"ns":[10,10,10],"incs":[0,0,5]}'))
    assert is_close(res['pairwise']['pvalues'][2], 0.032507)
    # trend pvalue will vary; requires bootstrapping
    assert is_close(res['trend']['pvalue'], 0.005, tol=0.002)


if __name__ == "__main__":
    # pass data to and from R as json-strings; no need to dump/load
    for data in sys.stdin:
        print((calculate_stats(data)))
