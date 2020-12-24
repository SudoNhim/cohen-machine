import { Theme, Typography, makeStyles } from "@material-ui/core";
import { Fragment } from "cohen-db/schema";
import * as React from "react";
import { connect } from "react-redux";
import { RouteComponentProps, withRouter } from "react-router";

import { IAnnotationsGroup } from "../../../shared/ApiTypes";
import { SerializeDocRef } from "../../../shared/util";
import { IAppState } from "../../model";
import TokenView from "./TokenView";

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    display: "inline",
    padding: theme.spacing(0.3),
  },
  selectable: {
    cursor: "pointer",
    "&:hover": {
      background: "rgba(200, 200, 255, 0.2)",
    },
  },
  selected: {
    background: "lightyellow",
    cursor: "pointer",
  },
  annotationHint: {
    background: "rgb(240, 240, 240)",
  },
  idLabel: {
    display: "inline-block",
    marginRight: 8,
    width: 20,
    textAlign: "right",
    fontSize: 14,
    fontWeight: "bold",
    color: theme.palette.text.disabled,
  },
  speakerTag: {
    color: theme.palette.text.secondary,
  },
}));

interface IProps extends RouteComponentProps {
  fragment: Fragment;
  previous: Fragment;
  sectionId?: string;
  interactive: boolean;
  annotations: IAnnotationsGroup[];
}

const FragmentView: React.FunctionComponent<IProps> = (props) => {
  const classes = useStyles();

  const frag = props.fragment;
  if (frag.kind === "lineBreak") {
    return <br />;
  } else {
    let textPart: JSX.Element;
    if (frag.id) {
      const fullId = props.sectionId
        ? `${props.sectionId}:${frag.id}`
        : frag.id;
      const hasAnnotations = !!props.annotations.find(
        (anno) => SerializeDocRef(anno.anchor).split("#")[1] === fullId
      );
      const isSelected = props.location.hash.split("/")[0] === `#${fullId}`;
      const handleClick = (evt: React.MouseEvent<HTMLDivElement>) => {
        evt.stopPropagation();
        if (isSelected) {
          props.history.push(`${props.location.pathname}`);
        } else {
          props.history.push(`${props.location.pathname}#${fullId}/notes`);
        }
      };

      textPart = (
        <div
          id={fullId}
          className={
            props.interactive
              ? isSelected
                ? `${classes.root} ${classes.selected}`
                : hasAnnotations
                ? `${classes.root} ${classes.selectable} ${classes.annotationHint}`
                : `${classes.root} ${classes.selectable}`
              : classes.root
          }
          onClick={(evt) => props.interactive && handleClick(evt)}
        >
          {
            <Typography
              className={classes.idLabel}
              display="inline"
              component="div"
            >
              {frag.id}
            </Typography>
          }
          {frag.tokens.map((tok, i) => (
            <TokenView token={tok} key={i} />
          ))}
        </div>
      );
    } else {
      textPart = (
        <div className={classes.root}>
          {frag.tokens.map((tok, i) => (
            <TokenView token={tok} key={i} />
          ))}
        </div>
      );
    }

    const renderSpeaker = frag.speaker && props.previous?.kind !== "text";
    return renderSpeaker ? (
      <React.Fragment>
        <span className={classes.speakerTag}>{frag.speaker}</span>
        {textPart}
      </React.Fragment>
    ) : (
      textPart
    );
  }
};

const mapStateToProps = (state: IAppState, ownProps) => ({
  fragment: ownProps.fragment,
  previous: ownProps.previous,
  sessionId: ownProps.sessionId,
  interactive: ownProps.interactive,
  annotations:
    state.docs.cache[state.focus?.reference.documentId]?.annotations || [],
});

export default connect(mapStateToProps, {})(withRouter(FragmentView));
