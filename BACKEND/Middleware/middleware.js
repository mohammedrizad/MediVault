const jwt = require('jsonwebtoken');

const verifyToken = async (req, res, next) => {

        const authtoken = req.headers['authorization'];
        const token=authtoken && authtoken.split(' ')[1];
        if(token)
        {
            const secretKey = 'this is your secret key to login';
            jwt.verify(token,secretKey,(err)=>{
                if(err)
                {
                    res.json({
                        msg:"Unauthorized"
                    });
                }
                else{
                    next();
                }
            })
        }
        else{
            res.json("Token not found")
        }
}

module.exports = verifyToken;