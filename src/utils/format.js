export function formatMatchName(match, teams) {
  const home = teams.find(t => t.id === match.home_team_id)?.name || 'Home';
  const away = teams.find(t => t.id === match.away_team_id)?.name || 'Away';
  const code = (match.id||'').toString().slice(0,6);
  const dt = match.starts_at ? new Date(match.starts_at).toLocaleString() : '';
  return `${home} x ${away} — ${dt} — ${code}`;
}
