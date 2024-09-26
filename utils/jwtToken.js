const sendToken = (user, statusCode, res) => {
    const token = user.getJwtToken();
    const username = user.name;
    const id = user.id;
    const options = {
        expires: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        httpOnly: true,
        sameSite: "none",
        secure: true,
    }
    res.status(statusCode).cookie("token", token, options).json({
        success: true,
        token,
        username,
        id
      });
}
module.exports = sendToken;