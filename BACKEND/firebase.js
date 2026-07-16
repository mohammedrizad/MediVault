const admin = require("firebase-admin");

const serviceAccount = require("./dinesh-22aee-firebase-adminsdk-dbpeo-072e18a2b4.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

module.exports=admin