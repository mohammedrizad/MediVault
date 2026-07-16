const admin=require('../firebase')

const verifyToken = async (idToken) => {
    try {
      const decodedToken = await admin.auth().verifyIdToken(idToken);
      return { success: true, decodedToken };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

module.exports=verifyToken
