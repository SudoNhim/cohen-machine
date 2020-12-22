import * as React from "react";
import { connect } from "react-redux";

import { IAnnotationsGroup } from "../../../shared/ApiTypes";
import { DocRefEquals } from "../../../shared/util";
import { setDoc } from "../../actions";
import { IAppState, IFocusState } from "../../model";
import AnnotationsGroup from "./AnnotationsGroup";

interface IProps {
  focus: IFocusState;
  annotations: IAnnotationsGroup[];
  hasDoc: boolean;
}

const AnnotationsView: React.FunctionComponent<IProps> = (props) => {
  if (!props.hasDoc) {
    return null;
  }

  let annotations: IAnnotationsGroup[] = props.annotations;
  if (!!props.focus.reference) {
    annotations = annotations.filter((grp) =>
      DocRefEquals(grp.anchor, props.focus.reference)
    );
    if (annotations.length > 1)
      throw new Error("Expected only one annotation group per docpart");
    if (annotations.length === 0)
      annotations.push({
        anchor: props.focus.reference,
        annotations: [],
      });
  }

  return (
    <React.Fragment>
      {annotations.map((grp, i) => (
        <AnnotationsGroup
          annotationsGroup={grp}
          allowEdit={!!props.focus.reference}
          key={i}
        />
      ))}
    </React.Fragment>
  );
};

const mapStateToProps = (state: IAppState) => ({
  annotations:
    state.docs.cache[state.focus.reference.documentId]?.annotations || [],
  focus: state.focus,
  hasDoc: !!state.docs.cache[state.focus.reference.documentId],
});

export default connect(mapStateToProps, { setDoc })(AnnotationsView);
