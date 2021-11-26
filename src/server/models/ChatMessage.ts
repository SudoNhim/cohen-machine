import { Token } from "cohen-db/schema";
import mongoose from "mongoose";

// When a document has outstanding changes the latest version is stored in
// the mongodb updates table
export interface IChatMessageDocument extends mongoose.Document {
  time: Date;
  user: string;
  tokens: Token[];

  // Legacy
  content: (Token | { kind: "docref"; docRef: string })[];
}

const ChatMessageSchema = new mongoose.Schema<IChatMessageDocument>({
  time: Date,
  user: String,
  tokens: [Object],

  // Legacy
  content: [Object],
});

export const ChatMessage = mongoose.model<IChatMessageDocument>(
  "ChatMessage",
  ChatMessageSchema
);
