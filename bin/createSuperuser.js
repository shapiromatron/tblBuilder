import { Accounts } from 'meteor/accounts-base';
import { Roles } from 'meteor/alanning:roles';


var user = Accounts.createUser({
    username: 'username',
    email: 'email',
    password: 'password',
});

Roles.setUserRoles(user, ['default', 'staff', 'superuser']);
