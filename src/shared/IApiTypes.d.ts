export interface IDocMeta {
    kind: string;
    title: string;
    children?: string[];
}

export interface IDoc {
    // Markdown strings
    // Special links of the type [](#ObjectId) link to
    // other documents
    text?: string;
    description?: string;
    source?: string;

    date?: string;
    authors?: string[];

    // List of docids of docs that have links to this one
    referrers?: string[];
}

export interface IDocGraph {
    [id: string]: IDocMeta;
    dynamicCollectionRoot: IDocMeta;
}

export interface ISearchHit {
    id: string;
    preview: string;
}

export interface ISearchResults {
    term: string;
    hits: ISearchHit[];
}
