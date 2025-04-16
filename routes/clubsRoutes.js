import { Router } from "express";
import clubValidator from "../validator/clubValidator.js";
import bodyValidator from "../validator/bodyValidator.js";
import prisma from "../prisma/prismaClient.js";
import { body, param, validationResult } from "express-validator";
import clubsController from "../controller/clubsController.js";

const clubsRouter = Router();

clubsRouter.get("/new", clubsController.getNewClub);

clubsRouter.post(
  "/new",
  clubValidator,
  bodyValidator,
  async (req, res, next) => {
    const { approval, question, answer, ...club } = req.body;

    if (
      (approval && (question || answer)) ||
      (!approval && (!question || !answer))
    ) {
      return res.status(400).send("Bad Request");
    }
    if (approval) {
      delete req.body.approval;
    } else {
      delete req.body.question;
      delete req.body.answer;
      req.body.club_approval = {
        question,
        answer,
      };
    }
    next();
  },
  clubsController.postNewClub
);

clubsRouter.get("/myclubs", clubsController.getMyClubs);

clubsRouter.get("/owned", clubsController.getOwnedClubs);

clubsRouter.get("/favorites", clubsController.getFavorites);

clubsRouter.get("/:id", param("id").isInt(), clubsController.getClubById);

clubsRouter.get(
  "/:id/members",
  param("id").isInt(),
  clubsController.getClubMebers
);

clubsRouter.get(
  "/:id/messages",
  param("id").isInt(),
  clubsController.getClubMessages
);

clubsRouter.post(
  "/:id/messages",
  param("id").isInt(),
  body("message").isString().trim().isLength({ min: 1 }),
  bodyValidator,
  clubsController.postNewClubMessage
);

clubsRouter.get(
  "/:id/join",
  param("id").isInt(),
  clubsController.getJoinClubForm
);

clubsRouter.post("/:id/join", param("id").isInt(), clubsController.joinClub);

clubsRouter.get("/:id/leave", param("id").isInt(), clubsController.leaveClub);

clubsRouter.post(
  "/:id/info/edit",
  param("id").isInt(),
  async (req, res, next) => {
    const error = validationResult(req);
    if (!error.isEmpty()) return res.render("error_pages/404.ejs");
    next();
  },
  [body("name").trim().isLength({ min: 1 }), body("description").trim()],
  bodyValidator,
  clubsController.editClubInfo
);

clubsRouter.get("/:id/manage", param("id").isInt(), clubsController.manageClub);

clubsRouter.get(
  "/:id/approval/delete",
  param("id").isInt(),
  async (req, res, next) => {
    const error = validationResult(req);
    if (!error.isEmpty()) return res.render("error_pages/404.ejs");
    next();
  },
  clubsController.deleteClubApproval
);

clubsRouter.post(
  "/:id/approval/edit",
  param("id").isInt(),
  async (req, res, next) => {
    const error = validationResult(req);
    if (!error.isEmpty()) return res.render("error_pages/404.ejs");
    next();
  },
  [body("question").trim().isLength({ min: 1 }), body("answer").trim()],
  bodyValidator,
  clubsController.editClubApproval
);

clubsRouter.get(
  "/:id/messages/:message_id/delete",
  [param("id").isInt(), param("message_id").isInt()],
  async (req, res, next) => {
    const error = validationResult(req);
    if (!error.isEmpty()) return res.render("error_pages/404.ejs");
    next();
  },
  clubsController.deleteClubMessage
);

clubsRouter.get(
  "/:id/members/:member_id/revoke",
  [param("id").isInt(), param("member_id").isInt()],
  async (req, res, next) => {
    const error = validationResult(req);
    if (!error.isEmpty()) return res.render("error_pages/404.ejs");
    next();
  },
  async (req, res, next) => {
    const club_id = parseInt(req.params.id);
    const member_id = parseInt(req.params.member_id);
    try {
      const redirect = await prisma.$transaction(async (tx) => {
        const club = await tx.club.findUnique({
          where: { id: club_id },
          include: { members: { where: { member_id } } },
        });
        if (!club || club.members.length < 1) {
          next();
          return true;
        }
        const admin = await tx.clubMembership.findUnique({
          where: { club_id_member_id: { club_id, member_id: req.user.id } },
        });
        if (!admin || !admin.is_admin) {
          return res.status(401).send("Unauthorized");
        }
        if (admin.member_id == member_id) {
          return res.status(400).send("Cannot revoke an admin's membership.");
        }
        await tx.clubMembership.delete({
          where: { club_id_member_id: { club_id, member_id } },
        });
      });
      if (redirect == null) {
        res.redirect(`/clubs/${club_id}/manage`);
      }
    } catch (error) {
      next(error);
    }
  }
);

clubsRouter.get(
  "/:id/members/:member_id/promote",
  [param("id").isInt(), param("member_id").isInt()],
  async (req, res, next) => {
    const error = validationResult(req);
    if (!error.isEmpty()) return res.render("error_pages/404.ejs");
    next();
  },
  clubsController.promoteClubMember
);

clubsRouter.get("/", clubsController.getAllClubs);

export default clubsRouter;
