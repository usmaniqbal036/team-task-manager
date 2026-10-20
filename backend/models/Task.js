import mongoose, { Schema } from 'mongoose';

const TaskSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, 'Task title is required'],
      trim: true,
      minlength: [1, 'Task title cannot be empty'],
      maxlength: [200, 'Task title cannot exceed 200 characters'],
      index: true,
    },
    description: {
      type: String,
      trim: true,
      default: '',
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    team: {
      type: Schema.Types.ObjectId,
      ref: 'Team',
      required: [true, 'Team reference is required'],
      index: true,
    },
    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Creator reference is required'],
      index: true,
    },
    status: {
      type: String,
      enum: {
        values: ['To Do', 'In Progress', 'Completed'],
        message: '{VALUE} is not a valid task status',
      },
      default: 'To Do',
      index: true,
    },
    priority: {
      type: String,
      enum: {
        values: ['Low', 'Medium', 'High'],
        message: '{VALUE} is not a valid priority level',
      },
      default: 'Medium',
      index: true,
    },
    dueDate: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret) => {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Compound index for efficient team tasks querying and filtering
TaskSchema.index({ team: 1, status: 1, priority: 1 });

export const Task = mongoose.models.Task || mongoose.model('Task', TaskSchema);
