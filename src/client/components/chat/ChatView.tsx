import {
  Button,
  Divider,
  Paper,
  TextField,
  Theme,
  makeStyles,
} from "@material-ui/core";
import * as React from "react";
import { connect } from "react-redux";

import { IChatMessage } from "../../../shared/IApiTypes";
import { IAppState } from "../../model";
import ChatMessage from "./ChatMessage";

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    display: "flex",
    flexDirection: "column-reverse",
    overflowY: "scroll",
  },
  input: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
  paper: {
    // flex: 1,
    padding: theme.spacing(2),
  },
}));

interface IProps {
  messages: IChatMessage[];
  username: string;
  postMessage: (text: string) => void;
}

const ChatView: React.FunctionComponent<IProps> = (props) => {
  const classes = useStyles();

  const [newMessage, setNewMessage] = React.useState("");

  const handleSubmit = (evt: React.FormEvent<HTMLFormElement>) => {
    props.postMessage(newMessage);
    setNewMessage("");
    evt.preventDefault();
  };

  return (
    <div className={classes.root}>
      <Paper className={classes.paper}>
        {props.messages.map((msg, i) => (
          <ChatMessage message={msg} key={i} />
        ))}
        <form onSubmit={handleSubmit}>
          <TextField
            className={classes.input}
            placeholder={`Comment as ${props.username}`}
            fullWidth={true}
            value={newMessage}
            onChange={(evt) => setNewMessage(evt.target.value)}
          />
        </form>
      </Paper>
    </div>
  );
};

const mapStateToProps = (state: IAppState, ownProps) => ({
  messages: ownProps.messages,
  postMessage: ownProps.postMessage,
  username: state.user.username || "anonymous",
});

export default connect(mapStateToProps)(ChatView);
