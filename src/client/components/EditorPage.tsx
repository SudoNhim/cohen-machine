import {
  FormControlLabel,
  Paper,
  Switch,
  TextField,
  Theme,
  Typography,
  makeStyles,
} from "@material-ui/core";
import { CanonFile } from "cohen-db/schema";
import * as React from "react";
import { connect } from "react-redux";
import { RouteComponentProps } from "react-router";

import { IDoc, IDocGraph } from "../../shared/ApiTypes";
import { GenerateIdFromDoc } from "../../shared/util";
import { setDoc } from "../actions";
import { getDoc, postUserAction } from "../api";
import { IAppState } from "../model";
import { findParentId } from "../util";
import ContentEditor from "./editor/ContentEditor";
import EditorRibbon from "./editor/EditorRibbon";
import DocumentChoiceInput from "./shared/DocumentChoiceInput";
import DocumentKindSelect from "./shared/DocumentKindSelect";

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    padding: theme.spacing(2),
    minWidth: "32em",
  },
  inputPart: {
    marginBottom: 10,
    marginTop: 10,
  },
  secondary: {
    color: theme.palette.text.secondary,
  },
}));

/*
  Child of: [            ]
  Title: [               ]
  Metadata:
     [   ]: [            ]
     [   ]: [            ]
     [   ]: [            ]
     (+)
  Type: [simple|multipart]
  ?SectionTitle: [       ]
  Content:
     [[    ] [         ]
      [   ][]
      [         ]      ]
  Hint: 'Enter' to end fragment
    and again to create newline
*/

interface IMatchParams {
  docId?: string;
}

interface IProps extends RouteComponentProps<IMatchParams> {
  user: string;
  graph: IDocGraph;
  setDoc: typeof setDoc;
}

const EditorPage: React.FunctionComponent<IProps> = (props: IProps) => {
  const classes = useStyles();

  const [activeDocument, setActiveDocument] = React.useState<IDoc>(null);
  const [activeDocumentId, setActiveDocumentId] = React.useState<string | null>(
    null
  );
  const [parentDocumentId, setParentDocumentId] = React.useState<string | null>(
    null
  );

  const [undoStack, setUndoStack] = React.useState<{
    back: IDoc[];
    forward: IDoc[];
    coalesce: string | null;
  }>({ back: [], forward: [], coalesce: null });

  const makeEdit = (edit: IDoc, coalesce: string | null) => {
    setActiveDocument(edit);

    // If update is of the same coalesce type, edit top of stack
    // instead of pushing a new entry
    if (coalesce && undoStack.coalesce === coalesce) {
      setUndoStack({
        back: [
          ...undoStack.back.slice(0, undoStack.back.length - 1),
          activeDocument,
        ],
        forward: [],
        coalesce,
      });
    } else {
      setUndoStack({
        back: [...undoStack.back, activeDocument],
        forward: [],
        coalesce,
      });
    }
  };

  const undo = () => {
    setActiveDocument(undoStack.back[undoStack.back.length - 1]);
    setUndoStack({
      back: undoStack.back.slice(0, undoStack.back.length - 1),
      forward: [activeDocument, ...undoStack.forward],
      coalesce: null,
    });
  };

  const redo = () => {
    setActiveDocument(undoStack.forward[0]);
    setUndoStack({
      back: [...undoStack.back, activeDocument],
      forward: undoStack.forward.slice(1),
      coalesce: null,
    });
  };

  // Can only be changed when there is no content
  const [isMultipart, setIsMultipart] = React.useState(false);

  React.useEffect(() => {
    const documentId = props.match.params.docId;
    if (!documentId) {
      const newFile: CanonFile = {
        title: "",
        kind: null,
        user: props.user,
        version: 0,
        annotations: [],
      };
      setActiveDocument({ file: newFile });
    } else {
      if (props.graph[documentId]) {
        setActiveDocumentId(documentId);
        setParentDocumentId(findParentId(documentId, props.graph));
        getDoc(documentId).then((doc) => {
          setActiveDocument(doc);
          setIsMultipart(!!(doc.file.content?.kind === "multipart"));
        });
      } else {
        throw new Error(`Document ${documentId} not found`);
      }
    }
  }, [props.match.params.docId]);

  const isNewDocument = !props.match.params.docId;
  const id = activeDocument && GenerateIdFromDoc(activeDocument?.file);

  const save = async () => {
    const result = await postUserAction({
      kind: isNewDocument ? "addDocument" : "editDocument",
      documentId: id,
      file: activeDocument.file,
    });

    props.setDoc(id, activeDocument);

    if (result.error) throw result.error;
    else
      setUndoStack({
        ...undoStack,
        back: [],
        coalesce: null,
      });
  };

  return (
    <div>
      <EditorRibbon
        onUndo={undo}
        undoDisabled={!undoStack.back.length}
        onRedo={redo}
        redoDisabled={!undoStack.forward.length}
        onSave={save}
        saveDisabled={!activeDocument || !undoStack.back.length}
      />
      {activeDocument && (
        <Paper className={classes.root}>
          <div className={classes.inputPart}>
            <DocumentChoiceInput
              required={true}
              label={"Parent"}
              value={parentDocumentId}
              onChange={setParentDocumentId}
            />
          </div>
          <div className={classes.inputPart}>
            <DocumentKindSelect
              required={true}
              disabled={!isNewDocument}
              value={activeDocument.file.kind || ""}
              onChange={(value) =>
                makeEdit(
                  {
                    ...activeDocument,
                    file: {
                      ...activeDocument.file,
                      kind: value,
                    },
                  },
                  null
                )
              }
            />
          </div>
          <div className={classes.inputPart}>
            <TextField
              size="small"
              fullWidth={true}
              label="Title"
              variant="outlined"
              type="url"
              disabled={!isNewDocument}
              required={true}
              value={activeDocument.file.title}
              onChange={(evt) =>
                makeEdit(
                  {
                    ...activeDocument,
                    file: {
                      ...activeDocument.file,
                      title: evt.target.value,
                    },
                  },
                  "titleEdit"
                )
              }
            />
          </div>
          <Typography className={classes.secondary}>
            Generated ID: {id}
          </Typography>
          <div className={classes.inputPart}>
            <TextField
              size="small"
              fullWidth={true}
              label="Date"
              variant="outlined"
              type="date"
              InputLabelProps={{ shrink: true }}
              value={activeDocument.file.metadata?.date}
              onChange={(evt) =>
                makeEdit(
                  {
                    ...activeDocument,
                    file: {
                      ...activeDocument.file,
                      metadata: {
                        ...activeDocument.file.metadata,
                        date: evt.target.value,
                      },
                    },
                  },
                  "dateEdit"
                )
              }
            />
          </div>
          <div className={classes.inputPart}>
            <FormControlLabel
              control={
                <Switch
                  color="primary"
                  checked={isMultipart}
                  onChange={() => setIsMultipart(!isMultipart)}
                  disabled={!!activeDocument.file.content}
                />
              }
              label="Multipart"
            />
          </div>
          <Typography className={classes.secondary}>
            ARROW KEYS or MOUSE to navigate. ENTER to enter/exit a fragment.
            SHIFT+ENTER to insert a newline. BACKSPACE to remove characters or
            fragments.
          </Typography>
          <div className={classes.inputPart}>
            <ContentEditor
              content={activeDocument.file.content}
              useMultipart={isMultipart}
              onChange={(content) =>
                makeEdit(
                  {
                    ...activeDocument,
                    file: {
                      ...activeDocument.file,
                      content,
                    },
                  },
                  null
                )
              }
            />
          </div>
        </Paper>
      )}
    </div>
  );
};

const mapStateToProps = (state: IAppState, ownProps) => ({
  user: state.user.username,
  graph: state.docs.graph,
});

export default connect(mapStateToProps, { setDoc })(EditorPage);
