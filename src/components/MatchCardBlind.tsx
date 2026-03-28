import type { Match } from '../types';
import { MatchCard } from './MatchCard';

interface MatchCardBlindProps {
  match: Match;
}

export function MatchCardBlind({ match }: MatchCardBlindProps) {
  return <MatchCard match={match} blindMode />;
}
