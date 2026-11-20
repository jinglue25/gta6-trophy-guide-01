export const isMasked = (trophy, spoilers, earned) => spoilers && trophy.kind === 'story' && !earned.has(trophy.id);
export function visibleTrophies(trophies, { search = '', kind = 'all', grade = 'all', spoilers = false, earned = new Set() }) {
  const query = search.trim().toLocaleLowerCase();
  return trophies.filter(t => {
    if (kind === 'missable' ? !t.missable : kind !== 'all' && t.kind !== kind) return false;
    if (grade !== 'all' && t.grade !== grade) return false;
    if (!query) return true;
    if (isMasked(t, spoilers, earned)) return 'hidden trophy'.includes(query);
    return `${t.name} ${t.description}`.toLocaleLowerCase().includes(query);
  });
}
