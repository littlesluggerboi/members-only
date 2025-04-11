import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import bcrypt from "bcrypt";
import prisma from "../prisma/prismaClient.js";

passport.use(
  new LocalStrategy(async (username, password, done) => {
    try {
      const user = await prisma.member.findUnique({
        where: { email: username },
      });
      if (!user) {
        return done(null, false, {
          message: "Username is not associated with an account.",
        });
      }
      const match = await bcrypt.compare(password, user.password);
      if (!match) {
        return done(null, false, { message: "Incorrect password." });
      }
      return done(null, user);
    } catch (error) {
      return done(error);
    }
  })
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await prisma.member.findUnique({
      where: {
        id: parseInt(id),
      },
    });
    done(null, user);
  } catch (error) {
    done(error);
  }
});

export default passport;
