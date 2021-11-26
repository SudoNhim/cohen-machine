import bodyParser from "body-parser";
import { Router } from "express";
import passport from "passport";

import { IDoc } from "../../shared/ApiTypes";
import { IUserAction } from "../../shared/UserActions";
import { GraphController } from "../controllers/graph";
import { SearchController } from "../controllers/search";
import { StatisticsController } from "../controllers/statistics";
import { UserActionsController } from "../controllers/userActions";
import docsDb from "../database";
import { GeneratePreview } from "../lib/generate-preview";
import { Account, IAccount } from "../models/Account";
import { DocUpdate, IDocUpdate } from "../models/DocUpdate";
import { createRememberMeToken } from "../models/RememberMeToken";

const jsonParser = bodyParser.json();

export function apiRouter() {
  const router = Router();
  const graphProvider = new GraphController();
  const searchController = new SearchController();
  const statisticsController = new StatisticsController();
  const userActionsController = new UserActionsController();

  router.get("/docs/get/:docId", async (req, res) => {
    const doc = docsDb[req.params.docId];

    if (doc == null) return res.sendStatus(404);

    const referrers = graphProvider.getReferrers(req.params.docId);

    const out: IDoc = {
      file: doc,
    };

    if (doc.children)
      out.children = doc.children.map((id) =>
        GeneratePreview({ kind: "document", documentId: id })
      );

    if (referrers.length > 0)
      out.referrers = referrers.map((ref) => GeneratePreview(ref));

    res.json(out);
  });

  router.get("/docs/graph", async (req, res) => {
    res.json(graphProvider.getGraph());
  });

  router.get("/docs/search/:term", async (req, res) => {
    res.json(searchController.search(req.params.term));
  });

  router.post("/docs/post", jsonParser, async (req, res) => {
    const action = req.body.action as IUserAction;

    const user = (req.user as IAccount)?.username || "anonymous";

    try {
      userActionsController.apply(user, action);
    } catch (e) {
      res.json({ error: e.toString() });
    }

    res.end();
  });

  // special API route used to populate database repo
  router.get("/updates", async (req, res) => {
    const updates: any[] = [];
    for await (const update of await DocUpdate.find()) {
      const { _id, __v, ...file } = update.toObject();
      updates.push(file);
    }
    res.json(updates);
  });

  router.get("/user", async (req, res) => {
    res.json({ user: req.user as IAccount });
  });

  router.post("/login", passport.authenticate("local"), async (req, res) => {
    try {
      console.log("attempting initial cookie issue");
      const token = await createRememberMeToken(req.user as IAccount);
      res.cookie("remember_me", token, {
        path: "/",
        httpOnly: true,
        maxAge: 6048000000, // 70 days
      });
    } catch (err) {
      console.log("failed to issue initial cookie in login", err);
    }

    res.status(200);
    res.end();
  });

  router.post("/register", bodyParser.json(), async (req, res) => {
    const data: { username: string; email: string; password: string } =
      req.body;

    if (!data.username || data.username.length < 3 || data.username.length > 20)
      return res.json({
        error: "Username must be at least 3 characters and no more than 20",
      });

    if (!data.email) return res.json({ error: "Email required" });

    if (!data.password || data.password.length < 6)
      return res.json({ error: "Password must be at least six characters" });

    if (
      (await Account.exists({ username: data.username })) ||
      ["anonymous", "symbols bot"].includes(data.username)
    )
      return res.json({ error: "Username taken" });

    if (await Account.exists({ email: data.email }))
      return res.json({ error: "An account already exists for this email" });

    Account.register(
      new Account({ username: data.username, email: data.email }),
      data.password,
      function (error) {
        if (error) {
          return res.json({ error });
        }

        passport.authenticate("local")(req, res, async function () {
          try {
            const token = await createRememberMeToken(req.user as IAccount);
            res.cookie("remember_me", token, {
              path: "/",
              httpOnly: true,
              maxAge: 6048000000, // 70 days
            });
          } catch (err) {
            console.log("failed to issue initial cookie in registration", err);
          }
          res.redirect("/");
        });
      }
    );
  });

  router.get("/statistics", async (req, res) => {
    res.json(await statisticsController.getStatistics());
  });

  router.get("/feed", async (req, res) => {
    res.json(await statisticsController.getFeed());
  });

  return router;
}
