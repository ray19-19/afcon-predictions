export interface User {
  id: number;
  username: string;
  password_hash: string;
  is_admin: boolean;
  created_at: Date;
}

export interface Match {
  id: number;
  home_team: string;
  away_team: string;
  competition: string;
  venue?: string;
  match_date: string;
  kickoff_time: string;
  home_score?: number;
  away_score?: number;
  status: 'SCHEDULED' | 'LIVE' | 'FINISHED' | 'CANCELLED';
  created_at: Date;
  updated_at: Date;
}

export interface Prediction {
  id: number;
  user_id: number;
  match_id: number;
  predicted_home_score: number;
  predicted_away_score: number;
  points: number;
  created_at: Date;
  updated_at: Date;
}

export interface LeaderboardEntry {
  id: number;
  username: string;
  total_points: number;
  total_predictions: number;
}

export interface PredictionWithMatch extends Prediction {
  match: Match;
}

export interface MatchWithPrediction extends Match {
  user_prediction?: Prediction;
}
