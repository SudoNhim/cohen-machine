import * as React from "react";
import io from "socket.io-client";

import { IChatMessage } from "../../shared/IApiTypes";
import ChatView from "./chat/ChatView";

const Chat: React.FunctionComponent = () => {
  const [chatLog, setChatLog] = React.useState<IChatMessage[]>([]);
  console.log("rendering with chatlog length ", chatLog.length);

  React.useEffect(() => {
    console.log("setting up socket connection");
    const socket = io();
    socket.on("init", (messages: IChatMessage[]) => {
      console.log("setting chatlog");
      setChatLog([...messages]);
      socket.on("push", (message: IChatMessage) => {
        messages.push(message);
        setChatLog([...messages]);
      });
    });
  }, []);

  const sendMessage = (message: IChatMessage) => {
    io().emit("chat message", message);
  };

  return <ChatView messages={[...chatLog]} postMessage={sendMessage} />;
};

export default Chat;