const responses = await Promise.all([fetch('data/trophies.json'), fetch('data/roadmap.json')]);
if (responses.some(response => !response.ok)) throw new Error('Local guide data could not be loaded.');
export const [data, roadmap] = await Promise.all(responses.map(response => response.json()));
export const trophies = data.trophies;
export const byId = new Map(trophies.map(t => [t.id, t]));
export const roadmapOrder = [...roadmap.stages.flatMap(s => s.trophyIds), 1];
export const gradeOrder = ['platinum', 'gold', 'silver', 'bronze'];
