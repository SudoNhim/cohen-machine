import {
  Button,
  Card,
  CardContent,
  Divider,
  TextField,
  Typography,
  makeStyles,
} from "@material-ui/core";
import * as React from "react";
import { connect } from "react-redux";
import { Link } from "react-router-dom";

import {
  IAnnotation,
  IAnnotationTokenDocRef,
  IAnnotationTokenLink,
  IAnnotationTokenText,
  IAnnotationsGroup,
  IDoc,
  IDocGraph,
} from "../../../shared/IApiTypes";
import { setDoc } from "../../actions";
import { addAnnotation, getDoc } from "../../api";
import { IAppState, IHoverState } from "../../model";
import { snippetFromDoc } from "../../util";
import AddLinkDialog from "./AddLinkDialog";

const useStyles = makeStyles({
  root: {
    marginTop: 20,
    marginRight: 16,
    marginBottom: 16,
  },
  contentContainer: {
    paddingTop: 10,
    paddingBottom: 10,
  },
  content: {
    fontSize: 14,
  },
  userTag: {
    color: "grey",
    fontSize: 14,
  },
  title: {
    fontSize: 16,
  },
  link: {
    textDecoration: "underline",
  },
  externalLink: {
    textDecoration: "underline",
    color: "darkblue",
  },
  editorInput: {
    marginTop: 10,
    marginBottom: 10,
  },
  button: {
    marginRight: 10,
  },
});

interface IProps {
  docId: string;
  doc: IDoc;
  annotationsGroup: IAnnotationsGroup;
  hover: IHoverState;
  graph: IDocGraph;
  allowEdit: boolean;
  setDoc: typeof setDoc;
}

const AnnotationsGroup: React.FunctionComponent<IProps> = (props) => {
  const classes = useStyles();

  const [newAnnotationText, setNewAnnotationText] = React.useState("");

  const renderEditor = () => {
    if (!props.allowEdit) return null;

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const anno: IAnnotation = {
        user: null,
        content: [{ kind: "text", text: newAnnotationText }],
      };
      await addAnnotation(props.docId, props.annotationsGroup.anchor, anno);
      const loaded = await getDoc(props.docId);
      props.setDoc(props.docId, loaded);
      setNewAnnotationText("");
    };

    const [addLinkDialogOpen, setAddLinkDialogOpen] = React.useState(false);
    const handleAddLink = (text: string) => {
      const sep = newAnnotationText.endsWith(" ") ? "" : " ";
      setNewAnnotationText(newAnnotationText + sep + text);
      setAddLinkDialogOpen(false);
    };

    return (
      <React.Fragment>
        <Divider />
        <div className={classes.contentContainer}>
          <form onSubmit={handleSubmit}>
            <TextField
              className={classes.editorInput}
              size="small"
              fullWidth={true}
              label="New annotation"
              variant="outlined"
              multiline={true}
              value={newAnnotationText}
              onChange={(e) => setNewAnnotationText(e.target.value)}
            />
            <Button
              className={classes.button}
              variant="contained"
              onClick={() => setAddLinkDialogOpen(true)}
            >
              add link
            </Button>
            <Button
              className={classes.button}
              variant="contained"
              color="primary"
              type="submit"
              disabled={!newAnnotationText}
            >
              submit
            </Button>
          </form>
          <AddLinkDialog
            isOpen={addLinkDialogOpen}
            handleSubmit={handleAddLink}
          />
        </div>
      </React.Fragment>
    );
  };

  const renderToken = (
    tok: IAnnotationTokenText | IAnnotationTokenLink | IAnnotationTokenDocRef,
    key: number
  ) => {
    const docRef = (tok as IAnnotationTokenDocRef).docRef;
    const link = (tok as IAnnotationTokenLink).link;
    const text = (tok as IAnnotationTokenText).text;
    if (docRef)
      return (
        <Link
          to={`/doc/${docRef}`}
          key={key}
          onClick={(e) => e.stopPropagation()}
        >
          <span className={classes.link}>
            {props.graph[docRef] ? (
              props.graph[docRef].title
            ) : (
              <span style={{ color: "red" }}>{docRef}</span>
            )}
          </span>
        </Link>
      );
    else if (link)
      return (
        <a
          className={classes.externalLink}
          href={link}
          onClick={(e) => e.stopPropagation()}
          key={key}
        >
          {text}
        </a>
      );
    else return <span key={key}>{text}</span>;
  };

  const renderAnnoContent = (anno: IAnnotation, key: number): JSX.Element => (
    <React.Fragment key={key}>
      <Divider />
      <div className={classes.contentContainer}>
        <Typography
          className={classes.userTag}
          color="textSecondary"
          component="span"
        >
          {anno.user}:&nbsp;
        </Typography>
        <Typography className={classes.content} component="span">
          {anno.content.map((tok, i) => renderToken(tok, i))}
        </Typography>
      </div>
    </React.Fragment>
  );

  return (
    <Card className={classes.root}>
      <CardContent>
        <Typography className={classes.title} color="textSecondary">
          {snippetFromDoc(props.doc, props.annotationsGroup.anchor)}
        </Typography>
        {props.annotationsGroup.annotations.map((anno, i) =>
          renderAnnoContent(anno, i)
        )}
        {renderEditor()}
      </CardContent>
    </Card>
  );
};

const mapStateToProps = (state: IAppState, ownProps) => ({
  annotationsGroup: ownProps.annotationsGroup,
  doc: state.docs.cache[state.focus.docId],
  docId: state.focus.docId,
  hover: state.hover,
  graph: state.docs.graph,
  allowEdit: ownProps.allowEdit,
});

export default connect(mapStateToProps, { setDoc })(AnnotationsGroup);
