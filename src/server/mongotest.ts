import { CanonFile } from "cohen-db/schema";
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";

import { Account } from "./models/Account";
import { ChatMessage } from "./models/ChatMessage";
import { DocUpdate, IDocUpdate } from "./models/DocUpdate";

export async function createTestDatabase(dbName: string): Promise<void> {
  const mongod = await MongoMemoryServer.create({ instance: { dbName } });
  mongoose.connect(mongod.getUri());

  await Account.register(
    new Account({ username: "augustine", email: "augustine@hippo" }),
    "confessions"
  );

  await Account.register(
    new Account({ username: "anselm", email: "aquinas@sicily" }),
    "summa"
  );

  await Account.register(
    new Account({ username: "aquinas", email: "aquinas@canterbury" }),
    "ontological"
  );

  await new ChatMessage({
    time: new Date(370, 9, 22, 8, 23),
    user: "augustine",
    content: [
      {
        kind: "text",
        text: "God grant me chastity and continence, but not yet!",
      },
    ],
  }).save();

  await new ChatMessage({
    time: new Date(1093, 5, 3, 10, 17),
    user: "anselm",
    content: [
      {
        kind: "text",
        text: "Wow, have you guys seen ",
      },
      {
        kind: "docref",
        docRef: "song.master_song", // test old reference token
      },
      {
        kind: "text",
        text: "? I love it. I found it on ",
      },
      {
        kind: "link",
        link: "https://leonardcohennotes.com",
        text: "Leonard Cohen Notes",
      },
    ],
  }).save();

  await new ChatMessage({
    time: new Date(1255, 1, 15, 18, 40),
    user: "aquinas",
    content: [
      {
        kind: "text",
        text: "The things that we love tell us what we are.",
      },
    ],
  }).save();

  // test new reference style
  await new ChatMessage({
    time: new Date(1255, 1, 15, 18, 40),
    user: "aquinas",
    tokens: [
      {
        kind: "text",
        text: "Also check out",
      },
      {
        kind: "reference",
        reference: {
          kind: "section",
          documentId:
            "interview.1994_08_07_bbc_radio_1_leonard_cohens_tower_of_song",
          sectionId: "on_suzanne",
        },
      },
    ],
  }).save();

  const newUpdate = {
    time: new Date("2020-11-15T18:07:25.372Z"),
    user: "augustine",
    action: {
      kind: "addAnnotation",
      documentId: "song.gift",
      anchor: { kind: "fragment", documentId: "song.gift", fragmentId: "1" },
      content: [{ kind: "text", text: "thanks I love silence" }],
    },
    file: {
      title: "Gift",
      user: "augustine",
      version: 2,
      content: {
        kind: "simple",
        content: {
          fragments: [
            {
              id: "1",
              kind: "text",
              tokens: [{ kind: "text", text: "You tell me that silence" }],
            },
            { kind: "lineBreak" },
            {
              id: "2",
              kind: "text",
              tokens: [{ kind: "text", text: "is nearer to peace than poems" }],
            },
            { kind: "lineBreak" },
            {
              id: "3",
              kind: "text",
              tokens: [{ kind: "text", text: "but if for my gift" }],
            },
            { kind: "lineBreak" },
            {
              id: "4",
              kind: "text",
              tokens: [{ kind: "text", text: "I brought you silence" }],
            },
            { kind: "lineBreak" },
            {
              id: "5",
              kind: "text",
              tokens: [{ kind: "text", text: "(for I know silence)" }],
            },
            { kind: "lineBreak" },
            {
              id: "6",
              kind: "text",
              tokens: [{ kind: "text", text: "you would say" }],
            },
            { kind: "lineBreak" },
            {
              id: "7",
              kind: "text",
              tokens: [{ kind: "text", text: "This is not silence" }],
            },
            { kind: "lineBreak" },
            {
              id: "8",
              kind: "text",
              tokens: [{ kind: "text", text: "this is another poem" }],
            },
            { kind: "lineBreak" },
            {
              id: "9",
              kind: "text",
              tokens: [
                { kind: "text", text: "and you would hand it back to me." },
              ],
            },
            { kind: "lineBreak" },
          ],
        },
      },
      kind: "song",
      annotations: [
        {
          anchor: {
            kind: "fragment",
            documentId: "song.gift",
            fragmentId: "1",
          },
          annotations: [
            {
              id: "0",
              user: "augustine",
              tokens: [{ kind: "text", text: "thanks I love silence" }],
            },
          ],
        },
      ],
    },
  };
  await new DocUpdate(newUpdate).save();

  return;
}
