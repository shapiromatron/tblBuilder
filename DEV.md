First, follow the instructions for installing [meteor](http://docs.meteor.com).

You'll also need MongoDB. To install, follow the instructions for [installing](https://docs.mongodb.com/manual/installation/)

### Dependencies
Install python dependencies with `pip install -r requirements.txt`,
R dependencies with `bash requirements.sh`,
and javascript dependencies with `meteor npm install --save bcrypt babel-runtime python-shell xlsx d3 underscore filesaver.js`

### Create admin user
To create an admin user for yourself, first modify `bin/createSuperuser.js` with the username, email address and password you would like to use.
Then run `meteor shell` to open up the meteor shell and run `.load /path/to/tblBuilder/bin/createSuperuser.js` to create your admin user.

### Editing the settings.json
The only settings that are necessary to update are `scripts_path`, `python_path`, and `public.context`.
`scripts_path` is the absolute path to the `tblBuilder/src/private/scripts` folder.
`python_path` is the absolute path to Python 2.7.
`public.context` determines which platform you're targeting; should be either `ntp` or `iarc`.

### Loading dev database
If you've been supplied with a dev database, move it to your desktop and make sure Mongo is running, then load it into Mongo by running the commands:
```bash
unzip ~/Desktop/'Backup-Date'-backup.zip -d ~/Desktop/_extracted
mongorestore --drop --host localhost:3001 -d meteor ~/Desktop/_extracted
rm –rf ~/Desktop/_extracted
```

### Running the dev environment
A basic dev environment using `tmux` is set up with the Makefile.
If you don't have tmux installed, install with Homebrew using `brew install tmux`.
Start the dev environment by running `make dev`
