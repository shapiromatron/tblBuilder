#!/bin/bash

# automated installation of R requirements
R -e "install.packages(c('coin', 'rjson'), repos='http://cran.rstudio.com')"
