import os
import sys

from rpy2.robjects import r, globalenv


r_code = os.path.abspath(
    os.path.join(
        os.path.dirname(__file__), 'stats.R'))


def calculate_stats(data):
    with open(r_code) as f:
        txt = f.read()
    r(txt)
    getStats = globalenv['getStats']
    res = getStats(data)
    return res[0]


if __name__ == "__main__":
    # pass data to and from R as json-strings; no need to dump/load
    for data in sys.stdin:
        print(calculate_stats(data))
