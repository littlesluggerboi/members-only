import { Router } from "express";
import signupValidator from "../validator/signupValidator.js";
import prisma from "../prisma/prismaClient.js";
import bodyValidator from "../validator/bodyValidator.js";
import bcrypt from "bcrypt";
import passport from "passport";
import authController from "../controller/authController.js";

const indexRouter = Router();

indexRouter.get("/login", async (req, res, next) => {
  if (req.isAuthenticated()) {
    return res.redirect("/clubs/myclubs");
  }
  res.render("loginPage.ejs", {
    title: "Clubs | Login Page",
  });
});

indexRouter.post(
  "/login",
  passport.authenticate("local", { successRedirect: "/clubs/myclubs" })
);

indexRouter.get("/signup", async (req, res, next) => {
  res.render("signupPage.ejs", { title: "Clubs | Sign Up Page" });
});

indexRouter.post(
  "/signup",
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
      res.redirect("/login");
    } catch (error) {
      next(error);
    }
  }
);

indexRouter.get("/", async (req, res, next) => {
  res.render("homePage.ejs", { title: "Clubs | Join the Clubs" });
});

indexRouter.post(
  "/logout",
  authController.authenticateMiddleware,
  async (req, res, next) => {
    req.logOut((err) => {
      if (err) {
        return next(err);
      }
      res.redirect("/login");
    });
  }
);

export default indexRouter;
