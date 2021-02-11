let db = require("quick.db");
let users = new db.table("users");
for(const user of users.all()){
	let data = user.data;
	try {
		user.data = JSON.parse(data);
	} catch(e) {
		user.data = data;
	}
	user.data.register_timestamp = new Date("February 11, 2021").getTime();
	users.set(user.ID, user.data);
}
