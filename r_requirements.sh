#!/bin/bash

# automated installation of R requirements
R -e "install.packages(\"coin\", repos=\"http://cran.rstudio.com\")"
R -e "install.packages(\"rjson\", repos=\"http://cran.rstudio.com\")"
