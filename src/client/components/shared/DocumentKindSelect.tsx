import { MenuItem, TextField, makeStyles } from "@material-ui/core";
import React from "react";

const useStyles = makeStyles({
  input: {
    marginBottom: 10,
    marginTop: 10,
    paddingTop: 1,
    paddingBottom: 1,
  },
  kind: {
    fontSize: 14,
    color: "lightGrey",
  },
});

type DocumentKind =
  | "symbol"
  | "group"
  | "song"
  | "live"
  | "album"
  | "tour"
  | "interview"
  | "other";

const kinds: DocumentKind[] = [
  "symbol",
  "group",
  "song",
  "live",
  "album",
  "tour",
  "interview",
  "other",
];

interface IProps {
  value: DocumentKind | "";
  required?: boolean;
  disabled?: boolean;
  onChange: (value: DocumentKind) => void;
}

const DocumentKindSelect: React.FunctionComponent<IProps> = (props) => {
  const classes = useStyles();
  return (
    <TextField
      select
      disabled={props.disabled}
      value={props.value}
      onChange={(evt) => props.onChange(evt.target.value as DocumentKind)}
      variant="outlined"
      fullWidth={true}
      label={"Type"}
      size="small"
      required={props.required}
    >
      {kinds.map((kind, i) => (
        <MenuItem value={kind} key={i}>{`${kind
          .substr(0, 1)
          .toUpperCase()}${kind.substr(1)}`}</MenuItem>
      ))}
    </TextField>
  );
};

export default DocumentKindSelect;
