export interface Candidate {
  id_candidate: number;
  nom:          string;
  prenom:       string;
  age:          number;
  taille:       number;
  photo_url:    string;
  profession:   string | null;
  langues:      string | null;
}

export type VoteCategory =
  | 'miss_tahiti'
  | 'premiere_dauphine'
  | 'deuxieme_dauphine'
  | 'miss_heiva';

export interface UserVote {
  miss_tahiti_candidate_id?:       number | null;
  premiere_dauphine_candidate_id?: number | null;
  deuxieme_dauphine_candidate_id?: number | null;
  miss_heiva_candidate_id?:        number | null;
}

export interface VoteStats {
  id_candidate:  number;
  prenom:        string;
  nom:           string;
  miss_tahiti:         number;
  premiere_dauphine:   number;
  deuxieme_dauphine:   number;
  miss_heiva:          number;
}
