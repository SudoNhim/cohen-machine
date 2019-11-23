import * as React from "react";
import { connect } from "react-redux";
import { IAppState } from "../../model";
import { Metadata } from "cohen-db/schema";

const css = require("./docviewer.css");

interface IProps {
  metadata: Metadata;
}

class MetadataView extends React.Component<IProps> {
  public render() {
    return (
      <div>
        {Object.keys(this.props.metadata).map((key, i) => (
          <div key={i}>
            {key}
            : {JSON.stringify(this.props.metadata[key])}
          </div>
        ))}
      </div>
    );
  }
}

// currently not using redux connection
const mapStateToProps = (state: IAppState, ownProps: IProps) => ({
  metadata: ownProps.metadata
});

export default connect(mapStateToProps)(MetadataView);