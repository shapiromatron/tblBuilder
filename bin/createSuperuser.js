import { Accounts } from 'meteor/accounts-base';
import { Roles } from 'meteor/alanning:roles';


var user = Accounts.createUser({
        username: 'myusername',
        email: 'myemail@email.com',
        password: 'mypassword',
    }),
    role_names = Roles.getAllRoles().map((r) => r.name);

Roles.setUserRoles(user, role_names);
