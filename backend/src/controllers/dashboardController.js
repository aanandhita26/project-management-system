const prisma = require("../config/database");

const getDashboard = async (req, res) => {
  try {
    const userId = req.user.userId;

    const [
      totalProjects,
      totalTasks,
      completedTasks,
      pendingTasks,
      projectsInProgress,
    ] = await Promise.all([
      prisma.project.count({
        where: { userId },
      }),

      prisma.task.count({
        where: {
          project: {
            userId,
          },
        },
      }),

      prisma.task.count({
        where: {
          status: "COMPLETED",
          project: {
            userId,
          },
        },
      }),

      prisma.task.count({
        where: {
          status: "PENDING",
          project: {
            userId,
          },
        },
      }),

      prisma.project.count({
        where: {
          userId,
          status: "IN_PROGRESS",
        },
      }),
    ]);

    return res.status(200).json({
      dashboard: {
        totalProjects,
        totalTasks,
        completedTasks,
        pendingTasks,
        projectsInProgress,
      },
    });
  } catch (error) {
    console.error("Dashboard error:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

module.exports = {
  getDashboard,
};