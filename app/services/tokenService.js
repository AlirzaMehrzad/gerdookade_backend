const jwt = require('jsonwebtoken')

exports.sign = (data) => {
    return jwt.sign(data, process.env.APP_SECRET, {expiresIn: '1d'})
}

exports.verify = (token) => {
    try {
        const payload = jwt.verify(token, process.env.APP_SECRET)
        return true
    } 
    catch (error) {
        return false
    }
}

exports.decode = (token) => {

    return jwt.decode(token, process.env.APP_SECRET)

}