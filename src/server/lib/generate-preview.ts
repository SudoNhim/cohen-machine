import { isNullOrUndefined } from "util";

import { Text } from "cohen-db/schema";

import { IDocReference, IDocReferencePreview } from "../../shared/ApiTypes";
import docsDb from "../database";

/*
export function GenerateSnippet(docRef: IDocReference): string {
  const doc = CanonData[docRef.docId];

  if (!doc.content) {
    return "";
  }

  // Build a preview around the first match position
  const activeText: Text = Array.isArray(doc.content.content)
    ? doc.content.content[docRef.section - 1 || 0].content
    : doc.content.content;

  const activeParagraph =
    activeText.text[docRef.paragraph ? docRef.paragraph - 1 : 0];
  const activeLine = Array.isArray(activeParagraph)
    ? activeParagraph[docRef.line ? docRef.line - 1 : 0]
    : activeParagraph;

  return TrimString(activeLine, 64);
} */

export function GeneratePreview(docRef: IDocReference): IDocReferencePreview {
  const doc = docsDb[docRef.docId];

  if (!doc.content) {
    return {
      docRef,
      preview: {
        text: [],
      },
    };
  }

  // Build a preview around the first match position
  const activeText: Text = Array.isArray(doc.content.content)
    ? doc.content.content[docRef.section - 1 || 0].content
    : doc.content.content;

  const adjustedRef: IDocReference = {
    docId: docRef.docId,
  };

  if (!isNullOrUndefined(docRef.section)) adjustedRef.section = docRef.section;

  return {
    docRef,
    preview: GeneratePreviewText(
      activeText,
      docRef.paragraph || 1,
      docRef.line || 1
    ),
  };
}

// Generate a shortened preview view of the text that includes the indicated paragraph/line
function GeneratePreviewText(
  text: Text,
  paragraph: number,
  line: number
): Text {
  const budget = 4;
  const linelen = 64;
  var cost = 0;

  // 1-indexed to 0-indexed
  paragraph--;
  line--;

  var out: string[][] = [];
  while (cost < budget && paragraph < (text ? text.text.length : 0)) {
    var pout: string[] = [];

    const p = text.text[paragraph];
    const start = Math.max(line - 1, 0);
    const end = Math.max(line + 3, 3);
    let lines: string[];
    if (Array.isArray(p)) {
      lines = p.filter((_, i) => i >= start && i <= end);
    } else {
      lines = [p];
    }

    for (const str of lines) {
      const c = Math.ceil(str.length / linelen);
      cost += c;
      if (cost <= budget) pout.push(str);
      else {
        pout.push(TrimString(str, (budget - cost + c) * linelen));
        break;
      }
    }

    out.push(pout);
    paragraph = paragraph + 1;
  }

  return {
    text: out,
  };
}

function TrimString(str: string, len: number): string {
  if (str.length < len) return str;

  const lastSpace = str.substr(0, len).lastIndexOf(" ");
  return str.substr(0, lastSpace) + "...";
}
