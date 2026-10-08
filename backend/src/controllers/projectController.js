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

module.exports = {
  createProject,
};