var User = require('../models/userModel');

function getcv(){
User.find().then((users) =>{
    users.forEach( (user)=>{ 
        console.log( "user: " + user.firstName ); 
    });
})
}

getcv();
