import * as React from "react";
import { IAnnotation } from "../../../shared/IApiTypes";
import { connect } from "react-redux";
import Annotation from "./Annotation";

const css = require("./docviewer.css");

interface IProps {
    annotations: IAnnotation[];
}

interface IState {
    windowWidth: number;
    windowHeight: number;
}

class AnnotationsView extends React.Component<IProps, IState> {
    private updateDimensionsHandler: () => void;

    constructor(props: IProps) {
        super(props);
        this.state = {
            windowWidth: window.innerWidth,
            windowHeight: window.innerHeight
        }
        this.updateDimensionsHandler = this.updateDimensions.bind(this);
    }

    private updateDimensions() {
        this.setState({ windowWidth: window.innerWidth, windowHeight: window.innerHeight });
    };

    public componentDidMount() {
        window.addEventListener('resize', this.updateDimensionsHandler);
    }

    public componentWillUnmount() {
        window.removeEventListener('resize', this.updateDimensionsHandler);
    }

    public render(): JSX.Element {
        return <div className={css.annotations}>
            {this.props.annotations.map((anno, i) => <Annotation annotation={anno} key={i} />)}
        </div>;
    }
}

const mapStateToProps = (state, ownProps: IProps) => ({
    annotations: ownProps.annotations
});

export default connect(mapStateToProps)(AnnotationsView);
