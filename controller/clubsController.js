import prisma from "../prisma/prismaClient.js";
import { validationResult } from "express-validator";

const getNewClub = async (req, res, next) => {
  res.render("newclubPage.ejs", {
    title: "Clubs | New",
    heading: {
      user: {
        username: req.user.username,
        email: req.user.email,
        icon: req.user.username.charAt(0),
      },
      search: true,
    },
    form: {
      url: "/clubs/new",
      method: "post",
      club: { club_approval: {} },
      submit: "Submit",
    },
    sidebar: {},
  });
};

const postNewClub = async (req, res, next) => {
  const { club_approval, ...club } = req.body;
  if (club_approval) {
    club.club_approval = {
      create: club_approval,
    };
  }
  try {
    await prisma.club.create({
      data: {
        ...club,
        members: {
          create: {
            member: {
              connect: { id: req.user.id },
            },
            is_admin: true,
          },
        },
      },
    });
    return res.redirect("/clubs/myclubs");
  } catch (error) {
    next(error);
  }
};

const getMyClubs = async (req, res, next) => {
  let { search } = req.query;
  if (search) search = search.trim();
  try {
    let clubs = await prisma.clubMembership.findMany({
      where: {
        member_id: req.user.id,
        club: { name: { startsWith: search, mode: "insensitive" } },
      },
      select: {
        club: {
          include: { _count: { select: { members: true } } },
        },
      },
    });
    clubs = clubs.map((club) => {
      club = club.club;
      club.member_count = club._count.members;
      delete club._count;
      return club;
    });
    res.render("page.ejs", {
      title: "Clubs | My Clubs",
      heading: {
        user: {
          username: req.user.username,
          email: req.user.email,
          icon: req.user.username.charAt(0),
        },
        search: true,
      },
      clubs,
      sidebar: { myclubs: "selected" },
    });
  } catch (error) {
    next(error);
  }
};

const getOwnedClubs = async (req, res, next) => {
  let { search } = req.query;
  if (search) search = search.trim();
  try {
    let clubs = await prisma.clubMembership.findMany({
      where: {
        member_id: req.user.id,
        club: { name: { startsWith: search, mode: "insensitive" } },
        is_admin: true,
      },
      select: {
        club: {
          include: { _count: { select: { members: true } } },
        },
      },
    });
    clubs = clubs.map((club) => {
      club = club.club;
      club.member_count = club._count.members;
      delete club._count;
      return club;
    });
    res.render("page.ejs", {
      title: "Clubs | My Clubs",
      heading: {
        user: {
          username: req.user.username,
          email: req.user.email,
          icon: req.user.username.charAt(0),
        },
        search: true,
      },
      clubs,
      sidebar: { owned: "selected" },
    });
  } catch (error) {
    next(error);
  }
};

const getFavorites = async (req, res, next) => {
  res.status(503).send("Service Unavailable");
};

const getClubById = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return next();
  try {
    let club = await prisma.club.findUnique({
      where: { id: parseInt(req.params.id) },
      include: { _count: { select: { members: true, messages: true } } },
    });
    if (club == null) return next();
    club.total_members = club._count.members;
    club.total_messages = club._count.messages;
    club.created_at = new Date(club.created_at).toUTCString();
    delete club._count;

    const isMember = await prisma.clubMembership.findUnique({
      where: {
        club_id_member_id: {
          club_id: parseInt(req.params.id),
          member_id: req.user.id,
        },
      },
    });
    const actions = [
      { url: `/clubs/${club.id}`, class: "selected", label: "Info" },
      { url: `/clubs/${club.id}/members`, class: "", label: "Members" },
      { url: `/clubs/${club.id}/messages`, class: "", label: "Messages" },
    ];
    if (isMember && isMember.is_admin)
      actions.push({
        url: `/clubs/${club.id}/manage`,
        class: "",
        label: "Manage",
      });
    res.render("clubPageInfo.ejs", {
      title: `Club | ${club.name}`,
      heading: {
        user: {
          username: req.user.username,
          email: req.user.email,
          icon: req.user.username.charAt(0),
        },
      },
      sidebar: {},
      panel: {
        actions,
      },
      page: {
        url: `/clubs/${club.id}`,
        ismember: isMember != null,
      },
      club,
    });
  } catch (error) {
    next(error);
  }
};

const getClubMebers = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return next();
  try {
    let club = await prisma.club.findUnique({
      where: { id: parseInt(req.params.id) },
      select: { id: true, name: true },
    });
    if (club == null) return next();
    let members = await prisma.clubMembership.findMany({
      where: { club_id: parseInt(req.params.id) },
      select: {
        member: { select: { username: true, id: true } },
        is_admin: true,
      },
    });
    const isMember = members.find((val) => val.member.id == req.user.id);
    members = members.map((member) => {
      let role = "Member";
      if (member.is_admin) role = "Admin";
      return { username: member.member.username, role };
    });
    const actions = [
      { url: `/clubs/${club.id}`, class: "", label: "Info" },
      {
        url: `/clubs/${club.id}/members`,
        class: "selected",
        label: "Members",
      },
      { url: `/clubs/${club.id}/messages`, class: "", label: "Messages" },
    ];
    if (isMember && isMember.is_admin)
      actions.push({
        url: `/clubs/${club.id}/manage`,
        class: "",
        label: "Manage",
      });
    res.render("clubPageMembers.ejs", {
      title: `Club | ${club.name}`,
      heading: {
        user: {
          username: req.user.username,
          email: req.user.email,
          icon: req.user.username.charAt(0),
        },
      },
      sidebar: {},
      panel: {
        actions,
      },
      page: {
        url: `/clubs/${club.id}`,
        ismember: isMember != null,
      },
      club,
      members,
    });
  } catch (error) {
    next(error);
  }
};

const getClubMessages = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return next();
  try {
    let club = await prisma.club.findUnique({
      where: { id: parseInt(req.params.id) },
      select: {
        id: true,
        name: true,
        members: { where: { member_id: req.user.id } },
      },
    });
    if (club == null) {
      next();
      return true;
    }

    let select = {};
    if (club.members.length > 0) {
      select = {
        message: true,
        timestamp: true,
        member: {
          select: { username: true },
        },
      };
    } else {
      select = { message: true };
    }

    let messages = await prisma.clubMessages.findMany({
      where: {
        club_id: parseInt(req.params.id),
      },
      select,
    });

    if (club.members.length > 0) {
      messages = messages.map((message) => {
        message.author = message.member.username;
        message.timestamp = new Date(message.timestamp).toUTCString();
        delete message.member;
        return message;
      });
    } else {
      messages = messages.map((message) => {
        message.author = "Anonymous";
        message.timestamp = "####";
        return message;
      });
    }

    const actions = [
      { url: `/clubs/${club.id}`, class: "", label: "Info" },
      {
        url: `/clubs/${club.id}/members`,
        class: "",
        label: "Members",
      },
      {
        url: `/clubs/${club.id}/messages`,
        class: "selected",
        label: "Messages",
      },
    ];
    const admin = club.members[0];
    if (admin && admin.is_admin)
      actions.push({
        url: `/clubs/${club.id}/manage`,
        class: "",
        label: "Manage",
      });

    res.render("clubPageMessages.ejs", {
      title: `Club | ${club.name}`,
      heading: {
        user: {
          username: req.user.username,
          email: req.user.email,
          icon: req.user.username.charAt(0),
        },
      },
      sidebar: {},
      panel: {
        actions,
      },
      page: {
        url: `/clubs/${club.id}`,
        ismember: club.members.length > 0,
      },
      club,
      messages,
      form: { url: `/clubs/${club.id}/messages` },
    });
  } catch (error) {
    next(error);
  }
};

const postNewClubMessage = async (req, res, next) => {
  const { message } = req.body;
  let { id } = req.params;
  id = parseInt(id);
  try {
    const redirect = await prisma.$transaction(async (tx) => {
      const club = await tx.club.findUnique({
        where: { id },
        select: { id: true, members: { where: { member_id: req.user.id } } },
      });
      if (club == null) {
        next();
        return true;
      }
      const isMember = club.members[0];
      if (isMember == null) return res.status(401).send("Unauthorized");
      await tx.clubMessages.create({
        data: { member_id: isMember.member_id, club_id: club.id, message },
      });
    });
    if (redirect == null) return res.redirect(`/clubs/${id}/messages`);
  } catch (error) {
    next(error);
  }
};

const getJoinClubForm = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    next();
    return true;
  }
  const club_id = parseInt(req.params.id);
  try {
    const club = await prisma.club.findUnique({
      where: { id: club_id },
      select: {
        id: true,
        name: true,
        club_approval: { select: { question: true } },
        members: { where: { member_id: req.user.id } },
      },
    });
    if (club == null) {
      next();
      return true;
    }
    if (club.members.length > 0) return res.status(400).send("Bad Request");

    const actions = [
      { url: `/clubs/${club.id}`, class: "", label: "Info" },
      {
        url: `/clubs/${club.id}/members`,
        class: "",
        label: "Members",
      },
      {
        url: `/clubs/${club.id}/messages`,
        class: "",
        label: "Messages",
      },
    ];
    if (club.members.length > 0)
      actions.push({
        url: `/clubs/${club.id}/manage`,
        class: "",
        label: "Manage",
      });

    res.render("clubPageApproval.ejs", {
      title: `Clubs | ${club.name}`,
      heading: {
        user: {
          username: req.user.username,
          email: req.user.email,
          icon: req.user.username.charAt(0),
        },
      },
      sidebar: {},
      panel: {
        actions,
      },
      page: {
        url: `/clubs/${club.id}`,
        ismember: club.members.length > 0,
      },
      club,
      form: { ...club.club_approval, url: `/clubs/${club.id}/join` },
    });
  } catch (error) {
    return next(error);
  }
};

const joinClub = async (req, res, next) => {
  const errors = validationResult(req);
  const { answer } = req.body;
  if (!errors.isEmpty()) return next();
  const club_id = parseInt(req.params.id);
  try {
    const redirect = await prisma.$transaction(async (tx) => {
      const club = await tx.club.findUnique({
        where: { id: club_id },
        select: {
          id: true,
          name: true,
          club_approval: { select: { question: true, answer: true } },
          members: { where: { member_id: req.user.id } },
        },
      });
      if (club == null) {
        next();
        return true;
      }
      if (club.members.length > 0) return res.status(400).send("Bad Request");
      if (club.club_approval == null || club.club_approval.answer == answer) {
        await tx.clubMembership.create({
          data: { member_id: req.user.id, club_id },
        });
      } else {
        return res.status(400).send("Rejected");
      }
    });
    if (redirect == null) {
      res.redirect(`/clubs/${club_id}/members`);
    }
  } catch (error) {
    next(error);
  }
};

const leaveClub = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return next();
  const club_id = parseInt(req.params.id);
  try {
    const redirect = await prisma.$transaction(async (tx) => {
      const club = await tx.club.findUnique({
        where: { id: club_id },
        select: { id: true, members: { where: { member_id: req.user.id } } },
      });
      if (club == null) {
        next();
        return true;
      }
      const isMember = club.members[0];
      if (isMember == null || isMember.is_admin)
        return res.status(400).send("Bad Request");
      await tx.clubMembership.delete({
        where: { club_id_member_id: { club_id, member_id: req.user.id } },
      });
    });
    if (redirect == null) return res.redirect("/clubs/myclubs");
  } catch (error) {
    next(error);
  }
};

const editClubInfo = async (req, res, next) => {
  const club_id = parseInt(req.params.id);
  try {
    const club = await prisma.club.findUnique({
      include: {
        members: { where: { member_id: req.user.id } },
      },
      where: { id: club_id },
    });
    if (club == null) {
      next();
      return true;
    }
    const admin = club.members[0];
    if (!admin || !admin.is_admin) return res.status(401).send("Unauthorized");
    const data = {};
    for (let prop of Object.getOwnPropertyNames(req.body)) {
      if (req.body[prop] != club[prop]) {
        data[prop] = req.body[prop];
      }
    }
    await prisma.club.update({
      where: { id: club_id },
      data,
    });
    res.redirect(`/clubs/${club_id}/manage`);
  } catch (error) {
    next(error);
  }
};

const manageClub = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return next();
  const club_id = parseInt(req.params.id);
  let club = await prisma.club.findUnique({
    where: { id: club_id },
    select: {
      members: { where: { member_id: req.user.id } },
      name: true,
    },
  });
  if (club == null) return next();
  const isMember = club.members[0];
  if (!isMember || !isMember.is_admin)
    return res.status(401).send("Unauthorized");
  const actions = [
    { url: `/clubs/${club_id}`, class: "", label: "Info" },
    {
      url: `/clubs/${club_id}/members`,
      class: "",
      label: "Members",
    },
    {
      url: `/clubs/${club_id}/messages`,
      class: "",
      label: "Messages",
    },
    {
      url: `/clubs/${club_id}/manage`,
      class: "selected",
      label: "Manage",
    },
  ];
  club = await prisma.club.findUnique({
    where: {
      id: club_id,
    },
    include: {
      members: {
        select: {
          member: { omit: { password: true, email: true } },
          is_admin: true,
        },
      },
      messages: {
        select: {
          id: true,
          member: { select: { username: true } },
          message: true,
        },
      },
      club_approval: true,
    },
  });
  res.render("clubPageManage.ejs", {
    title: `Club | ${club.name}`,
    heading: {
      user: {
        username: req.user.username,
        email: req.user.email,
        icon: req.user.username.charAt(0),
      },
    },
    sidebar: {},
    panel: {
      actions,
    },
    page: {
      url: `/clubs/${club.id}`,
      ismember: club.members.length > 0,
    },
    club,
    form: {
      info: `/clubs/${club_id}/info/edit`,
      approval: `/clubs/${club_id}/approval/edit`,
      approval_removal: `/clubs/${club_id}/approval/delete`,
    },
  });
};

const deleteClubApproval = async (req, res, next) => {
  const club_id = parseInt(req.params.id);
  try {
    const redirect = await prisma.$transaction(async (tx) => {
      const club = await tx.club.findUnique({
        where: { id: club_id },
        include: {
          members: { where: { member_id: req.user.id } },
          club_approval: true,
        },
      });
      if (club == null) {
        next();
        return true;
      }
      const admin = club.members[0];
      if (!admin || !admin.is_admin)
        return res.status(401).send("Unauthorized");
      if (!club.club_approval) return res.status(400).send("Bad Resquest");
      await prisma.clubApproval.delete({ where: { club_id } });
    });
    if (redirect == null) {
      res.redirect(`/clubs/${club_id}/manage`);
    }
  } catch (error) {}
};

const editClubApproval = async (req, res, next) => {
  const club_id = parseInt(req.params.id);
  try {
    const redirect = await prisma.$transaction(async (tx) => {
      const club = await tx.club.findUnique({
        where: { id: club_id },
        include: {
          club_approval: true,
          members: { where: { member_id: req.user.id } },
        },
      });
      if (club == null) {
        next();
        return true;
      }
      const admin = club.members[0];
      if (!admin || !admin.is_admin)
        return res.status(401).send("Unauthorized");
      if (club.club_approval == null) {
        await tx.clubApproval.create({ data: { club_id, ...req.body } });
      } else {
        const data = {};
        for (let prop of Object.getOwnPropertyNames(req.body)) {
          if (req.body[prop] != club.club_approval[prop]) {
            data[prop] = req.body[prop];
          }
        }
        await tx.clubApproval.update({ where: { club_id }, data });
      }
    });
    if (redirect == null) {
      res.redirect(`/clubs/${club_id}/manage`);
    }
  } catch (error) {
    next(error);
  }
};

const deleteClubMessage = async (req, res, next) => {
  const club_id = parseInt(req.params.id);
  const message_id = parseInt(req.params.message_id);
  try {
    const redirect = await prisma.$transaction(async (tx) => {
      const club = await tx.club.findUnique({
        where: { id: club_id },
        include: {
          members: { where: { member_id: req.user.id } },
          messages: { where: { id: message_id } },
        },
      });
      if (club == null || club.messages.length < 1) {
        next();
        return true;
      }
      const admin = club.members[0];
      if (!admin || !admin.is_admin)
        return res.status(401).send("Unauthorized");
      await tx.clubMessages.delete({ where: { id: message_id } });
    });
    if (redirect == null) {
      return res.redirect(`/clubs/${club_id}/manage`);
    }
  } catch (error) {
    next(error);
  }
};

const promoteClubMember = async (req, res, next) => {
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
      const member = club.members[0];
      if (member.is_admin) {
        return null;
      }
      await tx.clubMembership.update({
        where: { club_id_member_id: { club_id, member_id: req.user.id } },
        data: { is_admin: false },
      });
      await tx.clubMembership.update({
        where: { club_id_member_id: { club_id, member_id } },
        data: { is_admin: true },
      });
    });
    if (redirect == null) {
      res.redirect(`/clubs/myclubs`);
    }
  } catch (error) {
    next(error);
  }
};

const getAllClubs = async (req, res, next) => {
  let { search } = req.query;
  if (search) search = search.trim();
  try {
    let clubs = await prisma.club.findMany({
      where: { name: { startsWith: search, mode: "insensitive" } },
      include: { _count: { select: { members: true } } },
    });
    clubs = clubs.map((club) => {
      club.member_count = club._count.members;
      delete club._count;
      return club;
    });
    res.render("page.ejs", {
      title: "Clubs | All",
      heading: {
        user: {
          username: req.user.username,
          email: req.user.email,
          icon: req.user.username.charAt(0),
        },
        search: true,
      },
      clubs,
      sidebar: { all: "selected" },
    });
  } catch (error) {
    next(error);
  }
};

export default {
  getNewClub,
  postNewClub,
  getMyClubs,
  getOwnedClubs,
  getFavorites,
  getClubById,
  getClubMebers,
  getClubMessages,
  postNewClubMessage,
  getJoinClubForm,
  joinClub,
  leaveClub,
  editClubInfo,
  manageClub,
  deleteClubApproval,
  editClubApproval,
  deleteClubMessage,
  promoteClubMember,
  getAllClubs,
};
