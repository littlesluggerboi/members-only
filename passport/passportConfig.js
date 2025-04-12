import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import prisma from "../prisma/prismaClient.js";
import bcrypt from "bcrypt";

passport.use(
  "local",
  new LocalStrategy(
    { usernameField: "email" },
    async (givenUsername, givenPassword, done) => {
      try {
        const queriedUser = await prisma.member.findUnique({
          where: { email: givenUsername },
        });
        if (!queriedUser) {
          return done(new Error("No account"), false);
        }
        const { password, ...user } = queriedUser;
        const match = await bcrypt.compare(givenPassword, password);
        if (match) {
          return done(null, user);
        }
        return done(new Error("Wrong Password", false));
      } catch (error) {
        return done(error);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  console.log("Serialize: ", user);
  return done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  console.log("Deserialize: ", id);
  try {
    const user = await prisma.member.findUnique({
      where: { id },
      omit: { password: true },
    });
    if (user) {
      return done(null, user);
    }
    return done(new Error("No user"), false);
  } catch (error) {
    return done(error);
  }
});
