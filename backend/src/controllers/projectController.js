const { z } = require("zod");
const prisma = require("../config/database");

const createProjectSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, "Project name is required"),

    description: z
      .string()
      .trim()
      .optional(),

    status: z
      .enum(["NOT_STARTED", "IN_PROGRESS", "COMPLETED"])
      .optional(),

    startDate: z
      .string()
      .optional(),

    endDate: z
      .string()
      .optional(),
  })
  .refine(
    (data) => {
      if (!data.startDate || !data.endDate) {
        return true;
      }

      return new Date(data.endDate) >= new Date(data.startDate);
    },
    {
      message: "End date must be on or after start date",
      path: ["endDate"],
    }
  );

const createProject = async (req, res) => {
  try {
    const result = createProjectSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        message: "Validation failed",
        errors: result.error.flatten().fieldErrors,
      });
    }

    const {
      name,
      description,
      status,
      startDate,
      endDate,
    } = result.data;

    const project = await prisma.project.create({
      data: {
        name,
        description: description || null,
        status: status || "NOT_STARTED",
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        userId: req.user.userId,
      },
    });

    return res.status(201).json({
      message: "Project created successfully",
      project,
    });
  } catch (error) {
    console.error("Create project error:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

const getProjects = async (req, res) => {
  try {
    const { search, status } = req.query;

    const projects = await prisma.project.findMany({
      where: {
        userId: req.user.userId,
        ...(search && {
          name: {
            contains: search,
            mode: "insensitive",
          },
        }),
        ...(status && {
          status,
        }),
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.status(200).json({ projects });
  } catch (error) {
    console.error("Get projects error:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};
const getProject = async (req, res) => {
  try {
    const { id } = req.params;

    const project = await prisma.project.findFirst({
      where: {
        id,
        userId: req.user.userId,
      },
    });

    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    return res.status(200).json({
      project,
    });
  } catch (error) {
    console.error("Get project error:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

const updateProject = async (req, res) => {
  try {
    const { id } = req.params;

    const updateProjectSchema = z
      .object({
        name: z.string().trim().min(1, "Project name is required").optional(),
        description: z.string().trim().optional(),
        status: z
          .enum(["NOT_STARTED", "IN_PROGRESS", "COMPLETED"])
          .optional(),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
      })
      .refine(
        (data) => {
          if (!data.startDate || !data.endDate) return true;
          return new Date(data.endDate) >= new Date(data.startDate);
        },
        {
          message: "End date must be on or after start date",
          path: ["endDate"],
        }
      );

    const result = updateProjectSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        message: "Validation failed",
        errors: result.error.flatten().fieldErrors,
      });
    }

    const existingProject = await prisma.project.findFirst({
      where: {
        id,
        userId: req.user.userId,
      },
    });

    if (!existingProject) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    const { name, description, status, startDate, endDate } = result.data;

    const project = await prisma.project.update({
      where: {
        id,
      },
      data: {
        ...(name !== undefined && { name }),
        ...(description !== undefined && {
          description: description || null,
        }),
        ...(status !== undefined && { status }),
        ...(startDate !== undefined && {
          startDate: startDate ? new Date(startDate) : null,
        }),
        ...(endDate !== undefined && {
          endDate: endDate ? new Date(endDate) : null,
        }),
      },
    });

    return res.status(200).json({
      message: "Project updated successfully",
      project,
    });
  } catch (error) {
    console.error("Update project error:", error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

const deleteProject = async (req, res) => {
  try {
    const { id } = req.params;

    const existingProject = await prisma.project.findFirst({
      where: {
        id,
        userId: req.user.userId,
      },
    });

    if (!existingProject) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    await prisma.project.delete({
      where: {
        id,
      },
    });

    return res.status(200).json({
      message: "Project deleted successfully",
    });
  } catch (error) {
    console.error("Delete project error:", error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

module.exports = {
  createProject,
  getProjects,
  getProject,
  updateProject,
  deleteProject,
};