export const toId = (ref) => (ref !== null && typeof ref === 'object' ? ref.id : ref);

export const getTeamOwnerId = (team) => toId(team.owner);

export const getTeamMemberIds = (team) => (team.members || []).map(toId);

export const isTeamOwner = (team, userId) => getTeamOwnerId(team) === userId;

export const isTeamMember = (team, userId) =>
  isTeamOwner(team, userId) || getTeamMemberIds(team).includes(userId);
