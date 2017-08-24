First, follow the instructions for installing [meteor](http://docs.meteor.com).

You'll also need MongoDB. To install, follow the instructions for [installing](https://docs.mongodb.com/manual/installation/)

### Dependencies
Install python dependencies with `pip install -r requirements.txt`,
R dependencies with `bash requirements.sh`,
and javascript dependencies with `meteor npm install --save bcrypt babel-runtime python-shell xlsx d3 underscore filesaver.js`

### Create admin user
To create an admin user for yourself, first modify `bin/createSuperuser.js` with the username, email address and password you would like to use.
Then run `meteor shell` to open up the meteor shell and run `.load /path/to/tblBuilder/bin/createSuperuser.js` to create your admin user.
