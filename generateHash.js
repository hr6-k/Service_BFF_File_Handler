const bcrypt = require('bcrypt');
const saltRounds = 10;
const password = '123';  // رمز عبور اصلی که می‌خواهید هش آن را بسازید

bcrypt.hash(password, saltRounds, function(err, hash) {
  if (err) throw err;
  console.log(hash);  // این هش را در فایل .env قرار دهید
});
