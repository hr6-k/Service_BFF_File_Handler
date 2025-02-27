const bcrypt = require('bcrypt');
const saltRounds = 10;
const password = '123';  

bcrypt.hash(password, saltRounds, function(err, hash) {
  if (err) throw err;
  console.log(hash); 
});
