const Visit = require("../models/Visit");
const Settings = require("../models/Settings");

const DEFAULT_TIMEZONE = "Asia/Kathmandu";
const VALID_VISIT_TYPES = new Set([
  "portfolio_visit",
  "section_view",
]);

const normalizePath = (value) => {
  if (typeof value !== "string") return "/";

  const trimmed = value.trim();

  if (!trimmed.startsWith("/")) return "/";

  return trimmed.slice(0, 120) || "/";
};

const normalizeVisitType = (value) => {
  return VALID_VISIT_TYPES.has(value)
    ? value
    : "portfolio_visit";
};

const getConfiguredTimezone = async () => {
  try {
    const settings = await Settings.findOne().select(
      "timezone"
    );

    return settings?.timezone || DEFAULT_TIMEZONE;
  } catch {
    return DEFAULT_TIMEZONE;
  }
};

const getDateParts = (date, timeZone) => {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);

  const map = Object.fromEntries(
    parts.map((part) => [part.type, part.value])
  );

  return {
    year: Number(map.year),
    month: Number(map.month),
    day: Number(map.day),
  };
};

const getTimeZoneOffsetMs = (date, timeZone) => {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);

  const map = Object.fromEntries(
    parts.map((part) => [part.type, part.value])
  );

  const asUtc = Date.UTC(
    Number(map.year),
    Number(map.month) - 1,
    Number(map.day),
    Number(map.hour),
    Number(map.minute),
    Number(map.second)
  );

  return asUtc - date.getTime();
};

const zonedStartOfDayToUtc = (parts, timeZone) => {
  const utcGuess = new Date(
    Date.UTC(parts.year, parts.month - 1, parts.day)
  );

  const offset = getTimeZoneOffsetMs(
    utcGuess,
    timeZone
  );

  let utcDate = new Date(utcGuess.getTime() - offset);
  const adjustedOffset = getTimeZoneOffsetMs(
    utcDate,
    timeZone
  );

  if (adjustedOffset !== offset) {
    utcDate = new Date(
      utcGuess.getTime() - adjustedOffset
    );
  }

  return utcDate;
};

const shiftDateParts = (parts, days) => {
  const shifted = new Date(
    Date.UTC(
      parts.year,
      parts.month - 1,
      parts.day + days
    )
  );

  return {
    year: shifted.getUTCFullYear(),
    month: shifted.getUTCMonth() + 1,
    day: shifted.getUTCDate(),
  };
};

const createVisit = async (req, res) => {
  try {
    await Visit.create({
      path: normalizePath(req.body.path),
      type: normalizeVisitType(req.body.type),
      userAgent: String(
        req.headers["user-agent"] || ""
      ).slice(0, 300),
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
    const timezone = await getConfiguredTimezone();
    const now = new Date();
    const todayParts = getDateParts(now, timezone);

    const startOfToday = zonedStartOfDayToUtc(
      todayParts,
      timezone
    );

    const startOfTomorrow = zonedStartOfDayToUtc(
      shiftDateParts(todayParts, 1),
      timezone
    );

    const startOfLast7Days = zonedStartOfDayToUtc(
      shiftDateParts(todayParts, -6),
      timezone
    );

    const startOfMonth = zonedStartOfDayToUtc(
      {
        year: todayParts.year,
        month: todayParts.month,
        day: 1,
      },
      timezone
    );

    const portfolioVisitMatch = {
      $or: [
        {
          type: "portfolio_visit",
        },
        {
          type: {
            $exists: false,
          },
          path: "/",
        },
      ],
    };

    const [
      totalViews,
      todayViews,
      weekViews,
      monthViews,
      dailyViews,
      popularPages,
    ] = await Promise.all([
      Visit.countDocuments(portfolioVisitMatch),

      Visit.countDocuments({
        ...portfolioVisitMatch,
        createdAt: {
          $gte: startOfToday,
          $lt: startOfTomorrow,
        },
      }),

      Visit.countDocuments({
        ...portfolioVisitMatch,
        createdAt: {
          $gte: startOfLast7Days,
          $lt: startOfTomorrow,
        },
      }),

      Visit.countDocuments({
        ...portfolioVisitMatch,
        createdAt: {
          $gte: startOfMonth,
          $lt: startOfTomorrow,
        },
      }),

      Visit.aggregate([
        {
          $match: {
            ...portfolioVisitMatch,
            createdAt: {
              $gte: startOfLast7Days,
              $lt: startOfTomorrow,
            },
          },
        },
        {
          $group: {
            _id: {
              $dateToString: {
                format: "%Y-%m-%d",
                date: "$createdAt",
                timezone,
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

      Visit.aggregate([
        {
          $match: portfolioVisitMatch,
        },
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
      timezone,
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
