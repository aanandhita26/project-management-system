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
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.status(200).json({
      tasks,
    });
  } catch (error) {
    console.error("Get tasks error:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

module.exports = {
  createTask,
  getTasks,
};