import { Router } from "express";
import signupValidator from "../validator/signupValidator.js";
import prisma from "../prisma/prismaClient.js";
import bodyValidator from "../validator/bodyValidator.js";
import bcrypt from "bcrypt";
import passport from "../passport/passportConfig.js";

const indexRouter = Router();

indexRouter.get("/log-in", async (req, res, next) => {
  res.render("loginPage.ejs", {
    title: "Clubs | Login Page",
  });
});

indexRouter.post(
  "/log-in", passport.authenticate("local"), async (req, res, next) => {
    res.redirect("/")
  }
);

indexRouter.get("/sign-up", async (req, res, next) => {
  res.render("signupPage.ejs", { title: "Clubs | Sign Up Page" });
});


indexRouter.post("/log-out", async (req, res, next) => {
  req.logOut((err) => {
    if (err) {
      return next(err);
    }
    res.redirect("/log-in");
  });
});

indexRouter.post(
  "/sign-up",
  signupValidator,
  bodyValidator,
  async (req, res, next) => {
    try {
      const hashedPassword = await bcrypt.hash(req.body.password, 10);
      const data = {
        username: req.body.username,
        email: req.body.email,
        password: hashedPassword,
      };
      await prisma.member.create({
        data,
      });
      res.redirect("/log-in");
    } catch (error) {
      next(error);
    }
  }
);

indexRouter.get("/", async (req, res, next) => {
  res.redirect("/log-in");
});

export default indexRouter;
