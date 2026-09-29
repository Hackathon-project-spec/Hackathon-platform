export function formatDate(isoString) {
  if (!isoString) return 'TBD';
  try {
    const d = new Date(isoString);
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return isoString;
  }
}

export function formatTimeRemaining(targetIsoString) {
  if (!targetIsoString) return 'No deadline set';
  const target = new Date(targetIsoString).getTime();
  const diff = target - Date.now();

  if (diff <= 0) return 'Deadline passed';

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  if (days > 0) return `${days}d ${hours}h remaining`;
  if (hours > 0) return `${hours}h ${minutes}m remaining`;
  return `${minutes}m remaining`;
}

export function formatZScore(zScore) {
  if (zScore === undefined || zScore === null || isNaN(zScore)) return '0.00σ';
  const num = Number(zScore);
  const sign = num > 0 ? '+' : '';
  return `${sign}${num.toFixed(2)}σ`;
}

export function getZScoreTone(zScore) {
  const num = Number(zScore || 0);
  if (num >= 1.0) return { label: 'Top Tier (+1σ)', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' };
  if (num >= 0.0) return { label: 'Above Avg', color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30' };
  if (num >= -1.0) return { label: 'Average', color: 'text-amber-400 bg-amber-500/10 border-amber-500/30' };
  return { label: 'Below Avg', color: 'text-rose-400 bg-rose-500/10 border-rose-500/30' };
}
