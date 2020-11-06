import { Divider, Typography, makeStyles } from "@material-ui/core";
import * as React from "react";
import { connect } from "react-redux";
import { Link } from "react-router-dom";

import {
  IAnnotation,
  IContentToken,
  IDocGraph,
} from "../../../shared/IApiTypes";
import { IAppState } from "../../model";

const useStyles = makeStyles({
  content: {
    fontSize: 14,
  },
  contentContainer: {
    paddingTop: 10,
    paddingBottom: 10,
  },
  highlight: {
    backgroundColor: "lightyellow",
  },
  previewTag: {
    color: "darkblue",
    fontSize: 14,
    textAlign: "center",
    marginBottom: 5,
  },
  userTag: {
    color: "grey",
    fontSize: 14,
  },
  link: {
    textDecoration: "underline",
  },
  externalLink: {
    textDecoration: "underline",
    color: "darkblue",
  },
});

interface IProps {
  annotation: IAnnotation;
  graph: IDocGraph;
  isPreview: boolean;
}

const Annotation: React.FunctionComponent<IProps> = (props) => {
  const classes = useStyles();

  const renderToken = (tok: IContentToken, key: number) => {
    if (tok.kind === "docref")
      return (
        <Link
          to={`/doc/${tok.docRef}`}
          key={key}
          onClick={(e) => e.stopPropagation()}
        >
          <span className={classes.link}>
            {props.graph[tok.docRef] ? (
              props.graph[tok.docRef].title
            ) : (
              <span style={{ color: "red" }}>{tok.docRef}</span>
            )}
          </span>
        </Link>
      );
    else if (tok.kind === "link")
      return (
        <a
          className={classes.externalLink}
          href={tok.link}
          onClick={(e) => e.stopPropagation()}
          key={key}
        >
          {tok.text}
        </a>
      );
    else return <span key={key}>{tok.text}</span>;
  };

  const containerClasses = props.isPreview
    ? [classes.contentContainer, classes.highlight]
    : [classes.contentContainer];

  return (
    <React.Fragment>
      <Divider />
      <div className={containerClasses.join(" ")}>
        {props.isPreview && (
          <Typography className={classes.previewTag}>preview</Typography>
        )}
        <Typography
          className={classes.userTag}
          color="textSecondary"
          component="span"
        >
          {props.annotation.user || "anonymous"}:&nbsp;
        </Typography>
        <Typography className={classes.content} component="span">
          {props.annotation.content.map((tok, i) => renderToken(tok, i))}
        </Typography>
      </div>
    </React.Fragment>
  );
};

const mapStateToProps = (state: IAppState, ownProps) => ({
  annotation: ownProps.annotation,
  isPreview: ownProps.isPreview || false,
  graph: state.docs.graph,
});

export default connect(mapStateToProps)(Annotation);