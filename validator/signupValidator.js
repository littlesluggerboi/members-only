import { body } from "express-validator";
import prisma from "../prisma/prismaClient.js";

const signupValidator = [
  body("username")
    .isString()
    .trim()
    .isLength({ min: 1 })
    .withMessage("Username is should not be empty.")
    .custom(async (username) => {
      const member = await prisma.member.findUnique({ where: { username } });
      if (member) {
        throw new Error("Username is already taken.");
      }
      return true;
    }),
  body("email")
    .isEmail()
    .withMessage("Invalid email value.")
    .trim()
    .isLength({ min: 1 })
    .withMessage("Email must not be empty")
    .custom(async (email) => {
      const member = await prisma.member.findUnique({ where: { email } });
      if (member) {
        throw new Error("Email address is already bound to an account.");
      }
      return true;
    }),
  body("password")
    .isString()
    .trim()
    .isLength({ min: 8 })
    .withMessage("Password must be composed of 8 characters."),
  body("confirm_password")
    .custom((val, { req }) => {
      return val === req.body.password;
    })
    .withMessage("Confirm Password does not match the given password."),
];

export default signupValidator;
