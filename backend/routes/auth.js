const router = require("express").Router();
const User = require("../models/User");
const CryptoJS = require("crypto-js");
const jwt = require("jsonwebtoken");

router.post("/register", async (req, res) => {
    const { username, firstName, lastName, email, password, isAdmin } = req.body;
  
    // Create a new user object
    const newUser = new User({
      firstName,
      lastName,
      username,
      email,
      password: CryptoJS.AES.encrypt(password, process.env.PASS_SEC).toString(),
      isAdmin: isAdmin || false, // Set the isAdmin flag based on the request or default to false
    });
  
    try {
      const savedUser = await newUser.save();
      res.status(201).json(savedUser);
    } catch (err) {
      res.status(500).json(err);
    }
  });
  
  
  // LOGIN
  
  router.post('/login', async (req, res) => {
    try {
      const user = await User.findOne({ username: req.body.username });
  
      if (!user) {
        return res.status(401).json("Wrong User Name");
      }
  
      const hashedPassword = CryptoJS.AES.decrypt(
        user.password,
        process.env.PASS_SEC
      );
  
      const originalPassword = hashedPassword.toString(CryptoJS.enc.Utf8)
      const inputPassword = req.body.password
  
      if (originalPassword !== inputPassword) {
        return res.status(401).json("Wrong Password");
      }
  
      const accessToken = jwt.sign(
        {
          id: user._id,
          isAdmin: user.isAdmin,
        },
        process.env.JWT_SEC,
        { expiresIn: "3d" }
      );
  
      const { password, ...others } = user._doc;
      res.status(200).json({ ...others, accessToken });
    } catch (err) {
      res.status(500).json(err);
    }
  });
  

module.exports = router;