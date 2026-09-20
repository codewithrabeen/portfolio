const Visit = require("../models/Visit");

const createVisit = async (req, res) => {
  try {
    await Visit.create({
      path: req.body.path || "/",
      userAgent: req.headers["user-agent"] || "",
      // We intentionally do not store the visitor's IP address.
    });

    res.status(201).json({
      success: true,
    });
  } catch (error) {
    console.error("Create visit error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to record visit.",
    });
  }
};

const getVisitStats = async (req, res) => {
  try {
    const now = new Date();

    // Start of today
    const startOfToday = new Date(now);
    startOfToday.setHours(0, 0, 0, 0);

    // Start of week — Sunday
    const startOfWeek = new Date(startOfToday);
    startOfWeek.setDate(
      startOfWeek.getDate() - startOfWeek.getDay()
    );

    // Start of month
    const startOfMonth = new Date(
      now.getFullYear(),
      now.getMonth(),
      1
    );

    // Start of previous 7 days
    const startOfLast7Days = new Date(startOfToday);
    startOfLast7Days.setDate(
      startOfLast7Days.getDate() - 6
    );

    const [
      totalViews,
      todayViews,
      weekViews,
      monthViews,
      dailyViews,
      popularPages,
    ] = await Promise.all([
      // Lifetime views
      Visit.countDocuments(),

      // Today
      Visit.countDocuments({
        createdAt: {
          $gte: startOfToday,
        },
      }),

      // This week
      Visit.countDocuments({
        createdAt: {
          $gte: startOfWeek,
        },
      }),

      // This month
      Visit.countDocuments({
        createdAt: {
          $gte: startOfMonth,
        },
      }),

      // Last 7 days
      Visit.aggregate([
        {
          $match: {
            createdAt: {
              $gte: startOfLast7Days,
            },
          },
        },
        {
          $group: {
            _id: {
              $dateToString: {
                format: "%Y-%m-%d",
                date: "$createdAt",
              },
            },
            views: {
              $sum: 1,
            },
          },
        },
        {
          $sort: {
            _id: 1,
          },
        },
      ]),

      // Most visited pages
      Visit.aggregate([
        {
          $group: {
            _id: "$path",
            views: {
              $sum: 1,
            },
          },
        },
        {
          $sort: {
            views: -1,
          },
        },
        {
          $limit: 5,
        },
      ]),
    ]);

    res.json({
      success: true,
      totalViews,
      todayViews,
      weekViews,
      monthViews,
      dailyViews,
      popularPages,
    });
  } catch (error) {
    console.error(
      "Get visit stats error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to fetch visit statistics.",
    });
  }
};

module.exports = {
  createVisit,
  getVisitStats,
};