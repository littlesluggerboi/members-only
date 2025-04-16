import express from "express";
import path from "node:path";
import dotenv from "dotenv";
import indexRouter from "./routes/indexRoutes.js";
import session from "express-session";
import passport from "passport";
import "./passport/passportConfig.js";
import { PrismaSessionStore } from "@quixo3/prisma-session-store";
import prisma from "./prisma/prismaClient.js";
import clubsRouter from "./routes/clubsRoutes.js";
import authController from "./controller/authController.js";

dotenv.config();

const PORT = process.env.PORT || 3000;

const app = express();
app.set("views", path.join(import.meta.dirname, "views"));
app.set("view engine", "ejs");
app.use(express.static(path.join(import.meta.dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.use(
  session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 24 * 60 * 60 * 1000 },
    store: new PrismaSessionStore(prisma, {
      checkPeriod: 2 * 60 * 1000, //ms
      dbRecordIdIsSessionId: true,
      dbRecordIdFunction: undefined,
    }),
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.use("/", indexRouter);
app.use("/clubs", authController.authenticateMiddleware, clubsRouter);

app.use((err, req, res, next) => {
  console.log(err);
  res.status(500).render("error_pages/500.ejs");
});

app.use((req, res) => {
  res.status(404).render("error_pages/404.ejs");
});

app.listen(PORT, () => {
  console.log(`listening at port: ${PORT}`);
});
