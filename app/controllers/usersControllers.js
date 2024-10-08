const userModel = require("../models/userModel");
const productModel = require("../models/productModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const userControll = {
  register: async (req, res, next) => {
    try {
      const { fname, lname, mobile, password, email, address } = req.body;
      if (fname === undefined || lname === "" || password === "") {
        return res.status(422).send({
          error: true,
          message: "اطلاعات ارسالی معتبر نیست",
        });
      }
      // validation
      const uniqueMobile = await userModel.findOne({ mobile });
      if (uniqueMobile) {
        return res.status(400).send({
          message: "شماره تلفن قبلا ثبت شده است",
        });
      }

      const regex =
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
      if (!regex.test(password)) {
        return res.status(400).send({
          message:
            "رمز عبور باید حداقل 8 کاراکتر باشد و شامل حروف کوچک و بزرگ و یک عدد و یک حرف و نکته خاص باشد",
        });
      }

      // security
      const passwordHash = await bcrypt.hash(password, 10);

      const newUser = new userModel({
        fname,
        lname,
        mobile,
        password: passwordHash,
        email,
        address,
        // userImage
      });

      await newUser.save();

      const accesstoken = creatAccessToken({ id: newUser._id });
      const refreshtoken = createRefreshToken({ id: newUser._id });

      res.cookie("refreshtoken", refreshtoken, {
        httpOnly: true,
        path: "/api/v1/user/refresh_token",
      });

      res.status(201).send({
        success: true,
        message: `${newUser.fname} عزیز به سامانه خوش آمدید`,
        token: accesstoken,
        newUser,
      });
    } catch (error) {
      next(error);
    }
  },

  login: async (req, res, next) => {
    try {
      const { mobile, password } = req.body;
      const user = await userModel.findOne({ mobile });
      if (!user) {
        return res.status(400).send({
          message: "کاربر وجود ندارد",
        });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).send({
          message: "پسورد اشتباه است",
        });
      }

      const accesstoken = creatAccessToken({ id: user._id });
      const refreshtoken = createRefreshToken({ id: user._id });

      res.cookie("refreshtoken", refreshtoken, {
        httpOnly: true,
        path: "/api/v1/user/refresh_token",
      });

      res.status(200).send({
        accesstoken,
        success: true,
        message: `${user.fname} ${user.lname} خوش آمدید`,
      });
    } catch (error) {
      next(error);
    }
  },

  logout: async (req, res, next) => {
    try {
      res.clearCookie("refreshtoken", {
        path: "/api/v1/user/refresh_token",
      });

      return res.status(201).send({
        message: "با موفقیت از سیستم خارج شدید",
      });
    } catch (error) {
      next(error);
    }
  },

  refreshtoken: (req, res, next) => {
    try {
      const rf_token = req.cookies.refreshtoken;
      if (!rf_token) {
        return res.status(400).send({
          error: true,
          message: "...لطفا وارد حساب کاربری شوید یا ثبت نام کنید",
        });
      }

      jwt.verify(rf_token, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
        if (err) {
          return res.status(400).send({
            error: true,
            message: "لطفا وارد حساب کاربری شوید یا ثبت نام کنید",
          });
        }
        const accesstoken = creatAccessToken({ id: user.id });
        res.status(201).send({ accesstoken });
      });
    } catch (error) {
      next(error);
    }
  },

  getUser: async (req, res, next) => {
    try {
      const user = await userModel.findById(req.user.id).select("-password");
      if (!user) {
        return res.status(401).send({
          message: "کاربر وجود ندارد",
        });
      }
      res.send(user);
    } catch (error) {
      next(error);
    }
  },

  addcart: async (req, res, next) => {
    try {
      const user = await userModel.findById(req.user.id);
      if (!user) {
        return res.status(400).send({
          message: "کاربر وجود ندارد",
        });
      }
      const cart = req.body.cart;
      res.status(200).send({
        status: "success",
        message: "با موفقیت به سبد خرید اضافه شد",
        cart,
      });

      await userModel.findOneAndUpdate({ _id: req.user.id }, { cart: cart });
    } catch (error) {
      next(error);
    }
  },

  editInfo: async (req, res, next) => {
    try {
      const user = await userModel.findById(req.params.id);
      if (!user) {
        return res.status(400).send({
          message: "کاربر وجود ندارد",
        });
      }
      const { fname, lname, address, mobile, email } = req.body;
      await userModel.findOneAndUpdate(
        { _id: req.params.id },
        { fname, lname, address, mobile, email }
      );
      res.status(200).send({
        status: "success",
        message: "با موفقیت ویرایش شد",
      });
    } catch (error) {
      next(error);
    }
  },
};

const creatAccessToken = (user) => {
  return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "1d" });
};

const createRefreshToken = (user) => {
  return jwt.sign(user, process.env.REFRESH_TOKEN_SECRET, { expiresIn: "7d" });
};

module.exports = userControll;
