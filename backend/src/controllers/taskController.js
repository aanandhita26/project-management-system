const { z } = require("zod");
const prisma = require("../config/database");

const createTaskSchema = z
  .object({
    name: z.string().trim().min(1, "Task name is required"),
    description: z.string().trim().optional(),
    priority: z.enum(["LOW", "MEDIUM", "HIGH"]).optional(),
    status: z
      .enum(["PENDING", "IN_PROGRESS", "COMPLETED"])
      .optional(),
    dueDate: z.string().optional(),
  });

const createTask = async (req, res) => {
  try {
    const { projectId } = req.params;

    const result = createTaskSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        message: "Validation failed",
        errors: result.error.flatten().fieldErrors,
      });
    }

    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        userId: req.user.userId,
      },
    });

    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    const {
      name,
      description,
      priority,
      status,
      dueDate,
    } = result.data;

    const task = await prisma.task.create({
      data: {
        name,
        description: description || null,
        priority: priority || "LOW",
        status: status || "PENDING",
        dueDate: dueDate ? new Date(dueDate) : null,
        projectId,
      },
    });

    return res.status(201).json({
      message: "Task created successfully",
      task,
    });
  } catch (error) {
    console.error("Create task error:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

const getTasks = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { search, status, priority } = req.query;

    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        userId: req.user.userId,
      },
    });

    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    const tasks = await prisma.task.findMany({
      where: {
        projectId,
        ...(search && {
          name: {
            contains: search,
            mode: "insensitive",
          },
        }),
        ...(status && {
          status,
        }),
        ...(priority && {
          priority,
        }),
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.status(200).json({ tasks });
  } catch (error) {
    console.error("Get tasks error:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

const getTask = async (req, res) => {
  try {
    const { projectId, taskId } = req.params;

    const task = await prisma.task.findFirst({
      where: {
        id: taskId,
        projectId,
        project: {
          userId: req.user.userId,
        },
      },
    });

    if (!task) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    return res.status(200).json({
      task,
    });
  } catch (error) {
    console.error("Get task error:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

const updateTask = async (req, res) => {
  try {
    const { projectId, taskId } = req.params;

    const updateTaskSchema = z.object({
      name: z.string().trim().min(1).optional(),
      description: z.string().trim().optional(),
      priority: z.enum(["LOW", "MEDIUM", "HIGH"]).optional(),
      status: z.enum(["PENDING", "IN_PROGRESS", "COMPLETED"]).optional(),
      dueDate: z.string().optional(),
    });

    const result = updateTaskSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        message: "Validation failed",
        errors: result.error.flatten().fieldErrors,
      });
    }

    const existingTask = await prisma.task.findFirst({
      where: {
        id: taskId,
        projectId,
        project: {
          userId: req.user.userId,
        },
      },
    });

    if (!existingTask) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    const { name, description, priority, status, dueDate } = result.data;

    const task = await prisma.task.update({
      where: {
        id: taskId,
      },
      data: {
        ...(name !== undefined && { name }),
        ...(description !== undefined && {
          description: description || null,
        }),
        ...(priority !== undefined && { priority }),
        ...(status !== undefined && { status }),
        ...(dueDate !== undefined && {
          dueDate: dueDate ? new Date(dueDate) : null,
        }),
      },
    });

    return res.status(200).json({
      message: "Task updated successfully",
      task,
    });
  } catch (error) {
    console.error("Update task error:", error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

const deleteTask = async (req, res) => {
  try {
    const { projectId, taskId } = req.params;

    const existingTask = await prisma.task.findFirst({
      where: {
        id: taskId,
        projectId,
        project: {
          userId: req.user.userId,
        },
      },
    });

    if (!existingTask) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    await prisma.task.delete({
      where: {
        id: taskId,
      },
    });

    return res.status(200).json({
      message: "Task deleted successfully",
    });
  } catch (error) {
    console.error("Delete task error:", error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

module.exports = {
  createTask,
  getTasks,
  getTask,
  updateTask,
  deleteTask,
};