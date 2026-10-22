// Shared team-access helpers.
//
// Depending on the data source, an owner/member/team reference is either a plain id
// or a populated { id, ... } object. These helpers normalise that once, so controllers
// and middleware do not repeat `typeof x === 'object' ? x.id : x` and the owner/member checks.

/** Returns the id of a reference that is either a plain id or a populated object. */
export const toId = (ref) => (ref !== null && typeof ref === 'object' ? ref.id : ref);

export const getTeamOwnerId = (team) => toId(team.owner);

export const getTeamMemberIds = (team) => (team.members || []).map(toId);

/** True when the user created/owns the team. */
export const isTeamOwner = (team, userId) => getTeamOwnerId(team) === userId;

/** True when the user is the team owner or one of its members. */
export const isTeamMember = (team, userId) =>
  isTeamOwner(team, userId) || getTeamMemberIds(team).includes(userId);
