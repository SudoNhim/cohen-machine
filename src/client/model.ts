import { IDoc, IDocGraph, ISearchResults, IDocReference } from '../shared/IApiTypes';

export interface IDocState {
    graph: IDocGraph;
    cache: { [id: string]: IDoc };
}

export interface IFocusState {
    docRef?: IDocReference;
    search?: boolean;
}

// We keep an array of focus states to match the navigation history
// All are rendered; only the one corresponding to the current history
// state is in view
export interface IFocusStateArray {
    frames: IFocusState[];
    index: number;

    // Set to true when navigating to a new url using #fragment
    // Unset when render is finished and scrollIntoView is called
    waitingToScroll?: boolean;
}

export interface IAppState {
    docs: IDocState;
    focus: IFocusStateArray;
    search: ISearchResults;
}