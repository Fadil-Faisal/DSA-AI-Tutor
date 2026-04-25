export type ExplanationMode = 'simple' | 'complex';

export type DSATopic =
  | 'arrays'
  | 'trees'
  | 'graphs'
  | 'dp'
  | 'recursion'
  | 'sorting'
  | 'searching'
  | 'strings'
  | 'heaps'
  | 'linked_lists';

export interface Confidence {
  arrays: number;
  trees: number;
  graphs: number;
  dp: number;
  recursion: number;
  sorting: number;
  searching: number;
  strings: number;
  heaps: number;
  linked_lists: number;
}

export interface LearnerProfile {
  session_id: string;
  explanation_mode: ExplanationMode;
  arrays_confidence: number;
  trees_confidence: number;
  graphs_confidence: number;
  dp_confidence: number;
  recursion_confidence: number;
  sorting_confidence: number;
  searching_confidence: number;
  strings_confidence: number;
  heaps_confidence: number;
  linked_lists_confidence: number;
  current_streak: number;
  total_problems_attempted: number;
  target_company: string | null;
  created_at?: string;
  updated_at?: string;
}
