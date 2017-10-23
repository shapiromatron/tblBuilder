# Running migrations

Migrations can be executed from the root folder of the source-code. Example
commands for environments are shown below:

    cd ./src
    mongo localhost:3001/meteor \
        ./private/migrations/libs/underscore-1.8.3-min.js \
        ./private/migrations/0012_exposure_migrate.js
