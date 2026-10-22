import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';
import { Team } from '../models/Team.js';
import { Task } from '../models/Task.js';
import { isTeamMember, toId } from '../utils/access.js';

class MemoryDatabase {
  users = new Map();
  teams = new Map();
  tasks = new Map();
  seeded = false;

  async initSeed() {
    if (this.seeded) return;
    this.seeded = true;

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash('Password123!', salt);

    const u1 = {
      id: 'usr_alex_001',
      name: 'Alex Morgan',
      email: 'alex@example.com',
      passwordHash: hash,
      createdAt: new Date('2026-01-10T10:00:00Z'),
      updatedAt: new Date('2026-01-10T10:00:00Z'),
    };
    const u2 = {
      id: 'usr_sarah_002',
      name: 'Sarah Chen',
      email: 'sarah@example.com',
      passwordHash: hash,
      createdAt: new Date('2026-01-11T11:00:00Z'),
      updatedAt: new Date('2026-01-11T11:00:00Z'),
    };
    const u3 = {
      id: 'usr_david_003',
      name: 'David Miller',
      email: 'david@example.com',
      passwordHash: hash,
      createdAt: new Date('2026-01-12T09:30:00Z'),
      updatedAt: new Date('2026-01-12T09:30:00Z'),
    };

    this.users.set(u1.id, u1);
    this.users.set(u2.id, u2);
    this.users.set(u3.id, u3);

    const team1 = {
      id: 'team_eng_101',
      name: 'Core Platform Engineering',
      description: 'Responsible for backend architecture, cloud infrastructure, and security.',
      owner: u1.id,
      members: [u1.id, u2.id, u3.id],
      createdAt: new Date('2026-01-15T08:00:00Z'),
      updatedAt: new Date('2026-01-15T08:00:00Z'),
    };

    const team2 = {
      id: 'team_prod_102',
      name: 'Product Design & UX',
      description: 'Designing intuitive user interfaces and continuous research iterations.',
      owner: u2.id,
      members: [u2.id, u1.id],
      createdAt: new Date('2026-01-18T14:00:00Z'),
      updatedAt: new Date('2026-01-18T14:00:00Z'),
    };

    this.teams.set(team1.id, team1);
    this.teams.set(team2.id, team2);

    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 3);

    const futureDate1 = new Date();
    futureDate1.setDate(futureDate1.getDate() + 4);

    const futureDate2 = new Date();
    futureDate2.setDate(futureDate2.getDate() + 10);

    const t1 = {
      id: 'tsk_001',
      title: 'Configure PostgreSQL Session Store for Production',
      description: 'Ensure connect-pg-simple is configured with secure cookies, pooling, and SSL.',
      team: team1.id,
      assignedTo: u1.id,
      createdBy: u1.id,
      status: 'Completed',
      priority: 'High',
      dueDate: pastDate,
      createdAt: new Date('2026-01-20T10:00:00Z'),
      updatedAt: new Date('2026-01-22T12:00:00Z'),
    };

    const t2 = {
      id: 'tsk_002',
      title: 'Implement Joi Validation on Authentication Routes',
      description: 'Validate name, email format, password complexity, and confirmPassword match.',
      team: team1.id,
      assignedTo: u2.id,
      createdBy: u1.id,
      status: 'In Progress',
      priority: 'High',
      dueDate: futureDate1,
      createdAt: new Date('2026-01-21T09:00:00Z'),
      updatedAt: new Date('2026-01-23T11:00:00Z'),
    };

    const t3 = {
      id: 'tsk_003',
      title: 'Audit Dockerfile and Cloud Run Health Endpoints',
      description:
        'Verify multi-stage build, non-root user execution, and graceful shutdown handling.',
      team: team1.id,
      assignedTo: u3.id,
      createdBy: u1.id,
      status: 'To Do',
      priority: 'Medium',
      dueDate: futureDate2,
      createdAt: new Date('2026-01-22T14:00:00Z'),
      updatedAt: new Date('2026-01-22T14:00:00Z'),
    };

    const t4 = {
      id: 'tsk_004',
      title: 'Design System Accessibility & WCAG Compliance Check',
      description:
        'Verify 4.5:1 text contrast, accessible form labels, and keyboard navigation rings.',
      team: team2.id,
      assignedTo: u2.id,
      createdBy: u2.id,
      status: 'In Progress',
      priority: 'Low',
      dueDate: futureDate1,
      createdAt: new Date('2026-01-23T10:00:00Z'),
      updatedAt: new Date('2026-01-24T15:00:00Z'),
    };

    this.tasks.set(t1.id, t1);
    this.tasks.set(t2.id, t2);
    this.tasks.set(t3.id, t3);
    this.tasks.set(t4.id, t4);
  }
}

export const memoryDb = new MemoryDatabase();

const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const isMongooseConnected = () => mongoose.connection.readyState === 1;

export class DataStore {
  static async findUserByEmail(email, includePassword = false) {
    const cleanEmail = email.toLowerCase().trim();
    if (isMongooseConnected()) {
      const query = User.findOne({ email: cleanEmail });
      if (includePassword) query.select('+passwordHash');
      const u = await query.exec();
      if (!u) return null;
      return {
        id: u._id.toString(),
        name: u.name,
        email: u.email,
        passwordHash: u.passwordHash,
        createdAt: u.createdAt,
        updatedAt: u.updatedAt,
      };
    }

    for (const u of memoryDb.users.values()) {
      if (u.email.toLowerCase() === cleanEmail) {
        return { ...u };
      }
    }
    return null;
  }

  static async findUserById(id) {
    if (isMongooseConnected()) {
      if (!mongoose.Types.ObjectId.isValid(id)) return null;
      const u = await User.findById(id).exec();
      if (!u) return null;
      return {
        id: u._id.toString(),
        name: u.name,
        email: u.email,
        passwordHash: '',
        createdAt: u.createdAt,
        updatedAt: u.updatedAt,
      };
    }

    const u = memoryDb.users.get(id);
    if (!u) return null;
    return { ...u, passwordHash: '' };
  }

  static async searchUsers(query, excludeUserId) {
    const term = query.toLowerCase().trim();
    if (isMongooseConnected()) {
      const filter = {
        $or: [
          { name: { $regex: escapeRegex(term), $options: 'i' } },
          { email: { $regex: escapeRegex(term), $options: 'i' } },
        ],
      };
      if (excludeUserId && mongoose.Types.ObjectId.isValid(excludeUserId)) {
        filter._id = { $ne: new mongoose.Types.ObjectId(excludeUserId) };
      }
      const list = await User.find(filter).limit(20).lean().exec();
      return list.map((u) => ({
        id: u._id.toString(),
        name: u.name,
        email: u.email,
      }));
    }

    const results = [];
    for (const u of memoryDb.users.values()) {
      if (excludeUserId && u.id === excludeUserId) continue;
      if (u.name.toLowerCase().includes(term) || u.email.toLowerCase().includes(term)) {
        results.push({ id: u.id, name: u.name, email: u.email });
      }
    }
    return results;
  }

  static async createUser(name, email, passwordHash) {
    const cleanEmail = email.toLowerCase().trim();
    if (isMongooseConnected()) {
      const u = await User.create({ name, email: cleanEmail, passwordHash });
      return {
        id: u._id.toString(),
        name: u.name,
        email: u.email,
        passwordHash: u.passwordHash,
        createdAt: u.createdAt,
        updatedAt: u.updatedAt,
      };
    }

    const id = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date();
    const newUser = {
      id,
      name: name.trim(),
      email: cleanEmail,
      passwordHash,
      createdAt: now,
      updatedAt: now,
    };
    memoryDb.users.set(id, newUser);
    return { ...newUser };
  }

  static async getTeamsForUser(userId) {
    if (isMongooseConnected()) {
      const objId = new mongoose.Types.ObjectId(userId);
      const teams = await Team.find({
        $or: [{ owner: objId }, { members: objId }],
      })
        .populate('owner', 'name email')
        .populate('members', 'name email')
        .sort({ updatedAt: -1 })
        .lean()
        .exec();

      return teams.map((t) => ({
        id: t._id.toString(),
        name: t.name,
        description: t.description || '',
        owner: t.owner
          ? { id: t.owner._id.toString(), name: t.owner.name, email: t.owner.email }
          : t.owner,
        members: (t.members || []).map((m) => ({
          id: m._id.toString(),
          name: m.name,
          email: m.email,
        })),
        pendingInvites: (t.invites || []).map((i) => ({ email: i.email, invitedAt: i.createdAt })),
        createdAt: t.createdAt,
        updatedAt: t.updatedAt,
      }));
    }

    const list = [];
    for (const t of memoryDb.teams.values()) {
      if (isTeamMember(t, userId)) {
        list.push(this.populateTeam(t));
      }
    }
    return list.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
  }

  static async getTeamById(teamId) {
    if (isMongooseConnected()) {
      if (!mongoose.Types.ObjectId.isValid(teamId)) return null;
      const t = await Team.findById(teamId)
        .populate('owner', 'name email')
        .populate('members', 'name email')
        .lean()
        .exec();
      if (!t) return null;
      return {
        id: t._id.toString(),
        name: t.name,
        description: t.description || '',
        owner: { id: t.owner._id.toString(), name: t.owner.name, email: t.owner.email },
        members: (t.members || []).map((m) => ({
          id: m._id.toString(),
          name: m.name,
          email: m.email,
        })),
        pendingInvites: (t.invites || []).map((i) => ({ email: i.email, invitedAt: i.createdAt })),
        createdAt: t.createdAt,
        updatedAt: t.updatedAt,
      };
    }

    const t = memoryDb.teams.get(teamId);
    if (!t) return null;
    return this.populateTeam(t);
  }

  static async createTeam(name, description, ownerId) {
    if (isMongooseConnected()) {
      const t = await Team.create({
        name: name.trim(),
        description: (description || '').trim(),
        owner: new mongoose.Types.ObjectId(ownerId),
        members: [new mongoose.Types.ObjectId(ownerId)],
      });
      return await this.getTeamById(t._id.toString());
    }

    const id = `team_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date();
    const team = {
      id,
      name: name.trim(),
      description: (description || '').trim(),
      owner: ownerId,
      members: [ownerId],
      createdAt: now,
      updatedAt: now,
    };
    memoryDb.teams.set(id, team);
    return this.populateTeam(team);
  }

  static async updateTeam(teamId, updates) {
    if (isMongooseConnected()) {
      if (!mongoose.Types.ObjectId.isValid(teamId)) return null;
      await Team.findByIdAndUpdate(teamId, { ...updates, updatedAt: new Date() }).exec();
      return this.getTeamById(teamId);
    }

    const t = memoryDb.teams.get(teamId);
    if (!t) return null;
    if (updates.name !== undefined) t.name = updates.name.trim();
    if (updates.description !== undefined) t.description = updates.description.trim();
    t.updatedAt = new Date();
    memoryDb.teams.set(teamId, t);
    return this.populateTeam(t);
  }

  static async addMemberToTeam(teamId, memberUserId) {
    if (isMongooseConnected()) {
      if (
        !mongoose.Types.ObjectId.isValid(teamId) ||
        !mongoose.Types.ObjectId.isValid(memberUserId)
      )
        return null;
      await Team.findByIdAndUpdate(teamId, {
        $addToSet: { members: new mongoose.Types.ObjectId(memberUserId) },
        updatedAt: new Date(),
      }).exec();
      return this.getTeamById(teamId);
    }

    const t = memoryDb.teams.get(teamId);
    if (!t) return null;
    const memberIds = t.members.map((m) => (toId(m)));
    if (!memberIds.includes(memberUserId)) {
      t.members.push(memberUserId);
      t.updatedAt = new Date();
      memoryDb.teams.set(teamId, t);
    }
    return this.populateTeam(t);
  }

  static async addPendingInvite(teamId, email, invitedById) {
    const cleanEmail = email.toLowerCase().trim();
    if (isMongooseConnected()) {
      if (!mongoose.Types.ObjectId.isValid(teamId)) return null;
      await Team.updateOne(
        { _id: teamId, 'invites.email': { $ne: cleanEmail } },
        {
          $push: {
            invites: {
              email: cleanEmail,
              invitedBy: new mongoose.Types.ObjectId(invitedById),
              createdAt: new Date(),
            },
          },
          updatedAt: new Date(),
        }
      ).exec();
      return this.getTeamById(teamId);
    }

    const t = memoryDb.teams.get(teamId);
    if (!t) return null;
    t.invites = t.invites || [];
    if (!t.invites.some((i) => i.email === cleanEmail)) {
      t.invites.push({ email: cleanEmail, invitedBy: invitedById, createdAt: new Date() });
      t.updatedAt = new Date();
    }
    return this.populateTeam(t);
  }

  static async acceptPendingInvites(user) {
    const email = user.email.toLowerCase().trim();
    if (isMongooseConnected()) {
      await Team.updateMany(
        { 'invites.email': email },
        {
          $addToSet: { members: new mongoose.Types.ObjectId(user.id) },
          $pull: { invites: { email } },
          updatedAt: new Date(),
        }
      ).exec();
      return;
    }

    for (const t of memoryDb.teams.values()) {
      if (!(t.invites || []).some((i) => i.email === email)) continue;
      if (!t.members.includes(user.id)) t.members.push(user.id);
      t.invites = t.invites.filter((i) => i.email !== email);
      t.updatedAt = new Date();
    }
  }

  static async removeMemberFromTeam(teamId, memberUserId) {
    if (isMongooseConnected()) {
      if (
        !mongoose.Types.ObjectId.isValid(teamId) ||
        !mongoose.Types.ObjectId.isValid(memberUserId)
      )
        return null;
      await Team.findByIdAndUpdate(teamId, {
        $pull: { members: new mongoose.Types.ObjectId(memberUserId) },
        updatedAt: new Date(),
      }).exec();
      return this.getTeamById(teamId);
    }

    const t = memoryDb.teams.get(teamId);
    if (!t) return null;
    t.members = t.members.filter((m) => {
      const id = toId(m);
      return id !== memberUserId;
    });
    t.updatedAt = new Date();
    memoryDb.teams.set(teamId, t);
    return this.populateTeam(t);
  }

  static async deleteTeam(teamId) {
    if (isMongooseConnected()) {
      if (!mongoose.Types.ObjectId.isValid(teamId)) return false;
      await Task.deleteMany({ team: new mongoose.Types.ObjectId(teamId) }).exec();
      const res = await Team.findByIdAndDelete(teamId).exec();
      return !!res;
    }

    if (!memoryDb.teams.has(teamId)) return false;
    for (const [taskId, task] of memoryDb.tasks.entries()) {
      const tTeamId = toId(task.team);
      if (tTeamId === teamId) {
        memoryDb.tasks.delete(taskId);
      }
    }
    return memoryDb.teams.delete(teamId);
  }

  static async getTasks(filters) {
    const userTeams = await this.getTeamsForUser(filters.userId);
    const accessibleTeamIds = new Set(userTeams.map((t) => t.id));

    if (filters.teamId && !accessibleTeamIds.has(filters.teamId)) {
      return [];
    }

    if (isMongooseConnected()) {
      const query = {};

      if (filters.teamId) {
        query.team = new mongoose.Types.ObjectId(filters.teamId);
      } else {
        query.team = {
          $in: Array.from(accessibleTeamIds).map((id) => new mongoose.Types.ObjectId(id)),
        };
      }

      if (filters.assigneeId) {
        query.assignedTo = new mongoose.Types.ObjectId(filters.assigneeId);
      }

      if (filters.status) {
        query.status = filters.status;
      }

      if (filters.priority) {
        query.priority = filters.priority;
      }

      if (filters.search) {
        const regex = { $regex: escapeRegex(filters.search), $options: 'i' };
        query.$or = [{ title: regex }, { description: regex }];
      }

      const tasks = await Task.find(query)
        .populate('team', 'name description')
        .populate('assignedTo', 'name email')
        .populate('createdBy', 'name email')
        .sort({ updatedAt: -1 })
        .lean()
        .exec();

      return tasks.map((t) => ({
        id: t._id.toString(),
        title: t.title,
        description: t.description || '',
        team: t.team
          ? { id: t.team._id.toString(), name: t.team.name, description: t.team.description }
          : t.team,
        assignedTo: t.assignedTo
          ? { id: t.assignedTo._id.toString(), name: t.assignedTo.name, email: t.assignedTo.email }
          : null,
        createdBy: t.createdBy
          ? { id: t.createdBy._id.toString(), name: t.createdBy.name, email: t.createdBy.email }
          : t.createdBy,
        status: t.status,
        priority: t.priority,
        dueDate: t.dueDate,
        createdAt: t.createdAt,
        updatedAt: t.updatedAt,
      }));
    }

    const list = [];
    for (const t of memoryDb.tasks.values()) {
      const tTeamId = toId(t.team);
      if (!accessibleTeamIds.has(tTeamId)) continue;
      if (filters.teamId && tTeamId !== filters.teamId) continue;

      const tAssigneeId = t.assignedTo
        ? typeof t.assignedTo === 'object'
          ? t.assignedTo.id
          : t.assignedTo
        : null;
      if (filters.assigneeId && tAssigneeId !== filters.assigneeId) continue;

      if (filters.status && t.status !== filters.status) continue;
      if (filters.priority && t.priority !== filters.priority) continue;

      if (filters.search) {
        const s = filters.search.toLowerCase();
        const matches =
          t.title.toLowerCase().includes(s) || (t.description || '').toLowerCase().includes(s);
        if (!matches) continue;
      }

      list.push(this.populateTask(t));
    }

    return list.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
  }

  static async getTaskById(taskId) {
    if (isMongooseConnected()) {
      if (!mongoose.Types.ObjectId.isValid(taskId)) return null;
      const t = await Task.findById(taskId)
        .populate('team', 'name description')
        .populate('assignedTo', 'name email')
        .populate('createdBy', 'name email')
        .lean()
        .exec();
      if (!t) return null;
      return {
        id: t._id.toString(),
        title: t.title,
        description: t.description || '',
        team: t.team
          ? { id: t.team._id.toString(), name: t.team.name, description: t.team.description }
          : t.team,
        assignedTo: t.assignedTo
          ? { id: t.assignedTo._id.toString(), name: t.assignedTo.name, email: t.assignedTo.email }
          : null,
        createdBy: t.createdBy
          ? { id: t.createdBy._id.toString(), name: t.createdBy.name, email: t.createdBy.email }
          : t.createdBy,
        status: t.status,
        priority: t.priority,
        dueDate: t.dueDate,
        createdAt: t.createdAt,
        updatedAt: t.updatedAt,
      };
    }

    const t = memoryDb.tasks.get(taskId);
    if (!t) return null;
    return this.populateTask(t);
  }

  static async createTask(data) {
    if (isMongooseConnected()) {
      const task = await Task.create({
        title: data.title.trim(),
        description: (data.description || '').trim(),
        team: new mongoose.Types.ObjectId(data.teamId),
        assignedTo: data.assignedToId ? new mongoose.Types.ObjectId(data.assignedToId) : null,
        createdBy: new mongoose.Types.ObjectId(data.createdById),
        status: data.status || 'To Do',
        priority: data.priority || 'Medium',
        dueDate: data.dueDate || null,
      });
      return await this.getTaskById(task._id.toString());
    }

    const id = `tsk_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date();
    const task = {
      id,
      title: data.title.trim(),
      description: (data.description || '').trim(),
      team: data.teamId,
      assignedTo: data.assignedToId || null,
      createdBy: data.createdById,
      status: data.status || 'To Do',
      priority: data.priority || 'Medium',
      dueDate: data.dueDate || null,
      createdAt: now,
      updatedAt: now,
    };
    memoryDb.tasks.set(id, task);
    return this.populateTask(task);
  }

  static async updateTask(taskId, updates) {
    if (isMongooseConnected()) {
      if (!mongoose.Types.ObjectId.isValid(taskId)) return null;
      const updateObj = { updatedAt: new Date() };
      if (updates.title !== undefined) updateObj.title = updates.title.trim();
      if (updates.description !== undefined) updateObj.description = updates.description.trim();
      if (updates.assignedToId !== undefined) {
        updateObj.assignedTo = updates.assignedToId
          ? new mongoose.Types.ObjectId(updates.assignedToId)
          : null;
      }
      if (updates.status !== undefined) updateObj.status = updates.status;
      if (updates.priority !== undefined) updateObj.priority = updates.priority;
      if (updates.dueDate !== undefined) updateObj.dueDate = updates.dueDate;

      await Task.findByIdAndUpdate(taskId, updateObj).exec();
      return this.getTaskById(taskId);
    }

    const t = memoryDb.tasks.get(taskId);
    if (!t) return null;
    if (updates.title !== undefined) t.title = updates.title.trim();
    if (updates.description !== undefined) t.description = updates.description.trim();
    if (updates.assignedToId !== undefined) t.assignedTo = updates.assignedToId;
    if (updates.status !== undefined) t.status = updates.status;
    if (updates.priority !== undefined) t.priority = updates.priority;
    if (updates.dueDate !== undefined) t.dueDate = updates.dueDate;
    t.updatedAt = new Date();
    memoryDb.tasks.set(taskId, t);
    return this.populateTask(t);
  }

  static async deleteTask(taskId) {
    if (isMongooseConnected()) {
      if (!mongoose.Types.ObjectId.isValid(taskId)) return false;
      const res = await Task.findByIdAndDelete(taskId).exec();
      return !!res;
    }
    return memoryDb.tasks.delete(taskId);
  }

  static populateTeam(t) {
    const ownerId = toId(t.owner);
    const ownerObj = memoryDb.users.get(ownerId);

    const populatedMembers = (t.members || []).map((m) => {
      const mid = toId(m);
      const u = memoryDb.users.get(mid);
      return u
        ? { id: u.id, name: u.name, email: u.email }
        : { id: mid, name: 'Unknown User', email: '' };
    });

    const { invites = [], ...rest } = t;
    return {
      ...rest,
      owner: ownerObj ? { id: ownerObj.id, name: ownerObj.name, email: ownerObj.email } : t.owner,
      members: populatedMembers,
      pendingInvites: invites.map((i) => ({ email: i.email, invitedAt: i.createdAt })),
    };
  }

  static populateTask(t) {
    const teamId = toId(t.team);
    const teamObj = memoryDb.teams.get(teamId);

    const createdById = toId(t.createdBy);
    const creatorObj = memoryDb.users.get(createdById);

    let assignedObj = null;
    if (t.assignedTo) {
      const aid = toId(t.assignedTo);
      const u = memoryDb.users.get(aid);
      if (u) assignedObj = { id: u.id, name: u.name, email: u.email };
    }

    return {
      ...t,
      team: teamObj
        ? { id: teamObj.id, name: teamObj.name, description: teamObj.description }
        : t.team,
      createdBy: creatorObj
        ? { id: creatorObj.id, name: creatorObj.name, email: creatorObj.email }
        : t.createdBy,
      assignedTo: assignedObj,
    };
  }
}
