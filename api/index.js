"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc4) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc4 = __getOwnPropDesc(from, key)) || desc4.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// server/entry.ts
var entry_exports = {};
__export(entry_exports, {
  default: () => entry_default
});
module.exports = __toCommonJS(entry_exports);
var import_vercel = require("hono/vercel");

// server/index.ts
var import_config = require("dotenv/config");
var import_hono2 = require("hono");
var import_cors = require("hono/cors");
var import_logger = require("hono/logger");

// src/db/index.ts
var import_serverless = require("@neondatabase/serverless");
var import_neon_http = require("drizzle-orm/neon-http");

// src/db/schema.ts
var schema_exports = {};
__export(schema_exports, {
  activityLogs: () => activityLogs,
  galleryPhotos: () => galleryPhotos,
  targets: () => targets,
  transactions: () => transactions,
  users: () => users
});
var import_pg_core = require("drizzle-orm/pg-core");
var users = (0, import_pg_core.pgTable)("users", {
  id: (0, import_pg_core.uuid)("id").primaryKey().defaultRandom(),
  username: (0, import_pg_core.varchar)("username", { length: 100 }).unique().notNull(),
  email: (0, import_pg_core.varchar)("email", { length: 255 }).unique(),
  passwordHash: (0, import_pg_core.text)("password_hash").notNull(),
  fullName: (0, import_pg_core.varchar)("full_name", { length: 255 }),
  createdAt: (0, import_pg_core.timestamp)("created_at").defaultNow().notNull(),
  updatedAt: (0, import_pg_core.timestamp)("updated_at").defaultNow().notNull()
});
var transactions = (0, import_pg_core.pgTable)("transactions", {
  id: (0, import_pg_core.serial)("id").primaryKey(),
  amount: (0, import_pg_core.integer)("amount").notNull(),
  paymentMethod: (0, import_pg_core.varchar)("payment_method", { length: 50 }).notNull(),
  proofUrl: (0, import_pg_core.text)("proof_url"),
  depositMessage: (0, import_pg_core.text)("deposit_message"),
  transactionDate: (0, import_pg_core.timestamp)("transaction_date").notNull(),
  transactionType: (0, import_pg_core.varchar)("transaction_type", { length: 20 }).notNull().default("DEPOSIT"),
  createdBy: (0, import_pg_core.uuid)("created_by").notNull().references(() => users.id),
  updatedBy: (0, import_pg_core.uuid)("updated_by").references(() => users.id),
  deletedBy: (0, import_pg_core.uuid)("deleted_by").references(() => users.id),
  createdAt: (0, import_pg_core.timestamp)("created_at").defaultNow().notNull(),
  updatedAt: (0, import_pg_core.timestamp)("updated_at"),
  deletedAt: (0, import_pg_core.timestamp)("deleted_at")
});
var targets = (0, import_pg_core.pgTable)("targets", {
  id: (0, import_pg_core.serial)("id").primaryKey(),
  title: (0, import_pg_core.varchar)("title", { length: 255 }).notNull(),
  targetAmount: (0, import_pg_core.integer)("target_amount").notNull(),
  description: (0, import_pg_core.text)("description"),
  createdAt: (0, import_pg_core.timestamp)("created_at").defaultNow().notNull()
});
var galleryPhotos = (0, import_pg_core.pgTable)("gallery_photos", {
  id: (0, import_pg_core.serial)("id").primaryKey(),
  imageUrl: (0, import_pg_core.text)("image_url").notNull(),
  caption: (0, import_pg_core.text)("caption"),
  createdAt: (0, import_pg_core.timestamp)("created_at").defaultNow().notNull()
});
var activityLogs = (0, import_pg_core.pgTable)("activity_logs", {
  id: (0, import_pg_core.uuid)("id").primaryKey().defaultRandom(),
  userId: (0, import_pg_core.uuid)("user_id").notNull().references(() => users.id),
  action: (0, import_pg_core.varchar)("action", { length: 100 }).notNull(),
  entityType: (0, import_pg_core.varchar)("entity_type", { length: 50 }).notNull(),
  entityId: (0, import_pg_core.varchar)("entity_id", { length: 255 }).notNull(),
  description: (0, import_pg_core.text)("description"),
  createdAt: (0, import_pg_core.timestamp)("created_at").defaultNow().notNull()
});

// src/db/index.ts
var sql = (0, import_serverless.neon)(process.env["DATABASE_URL"]);
var db = (0, import_neon_http.drizzle)(sql, { schema: schema_exports });

// src/db/queries/transactions.ts
var import_drizzle_orm = require("drizzle-orm");
async function getTotalSavings() {
  const result = await db.select({
    totalSavings: import_drizzle_orm.sql`COALESCE(SUM(CASE WHEN ${transactions.transactionType} = 'DEPOSIT' THEN ${transactions.amount} ELSE -${transactions.amount} END), 0)`,
    totalDeposits: import_drizzle_orm.sql`COALESCE(SUM(CASE WHEN ${transactions.transactionType} = 'DEPOSIT' THEN ${transactions.amount} ELSE 0 END), 0)`,
    totalWithdrawals: import_drizzle_orm.sql`COALESCE(SUM(CASE WHEN ${transactions.transactionType} = 'WITHDRAWAL' THEN ${transactions.amount} ELSE 0 END), 0)`,
    transactionCount: import_drizzle_orm.sql`COUNT(*)`
  }).from(transactions).where((0, import_drizzle_orm.isNull)(transactions.deletedAt));
  return {
    totalSavings: Number(result[0]?.totalSavings ?? 0),
    totalDeposits: Number(result[0]?.totalDeposits ?? 0),
    totalWithdrawals: Number(result[0]?.totalWithdrawals ?? 0),
    transactionCount: Number(result[0]?.transactionCount ?? 0)
  };
}
async function getLatestTransactions(limit = 3) {
  return db.select().from(transactions).where((0, import_drizzle_orm.isNull)(transactions.deletedAt)).orderBy((0, import_drizzle_orm.desc)(transactions.transactionDate)).limit(limit);
}
async function getTransactions(filter = {}) {
  const { search, day, month, year, page = 1, limit = 10 } = filter;
  const offset = (page - 1) * limit;
  const conditions = [(0, import_drizzle_orm.isNull)(transactions.deletedAt)];
  if (search) {
    conditions.push(
      (0, import_drizzle_orm.ilike)(transactions.depositMessage, `%${search}%`)
    );
  }
  if (day) {
    const start = new Date(day);
    const end = new Date(day);
    end.setDate(end.getDate() + 1);
    conditions.push(
      (0, import_drizzle_orm.and)(
        (0, import_drizzle_orm.gte)(transactions.transactionDate, start),
        (0, import_drizzle_orm.lte)(transactions.transactionDate, end)
      )
    );
  } else if (month) {
    const [y, m] = month.split("-").map(Number);
    const start = new Date(y, m - 1, 1);
    const end = new Date(y, m, 1);
    conditions.push(
      (0, import_drizzle_orm.and)(
        (0, import_drizzle_orm.gte)(transactions.transactionDate, start),
        (0, import_drizzle_orm.lte)(transactions.transactionDate, end)
      )
    );
  } else if (year) {
    const y = Number(year);
    const start = new Date(y, 0, 1);
    const end = new Date(y + 1, 0, 1);
    conditions.push(
      (0, import_drizzle_orm.and)(
        (0, import_drizzle_orm.gte)(transactions.transactionDate, start),
        (0, import_drizzle_orm.lte)(transactions.transactionDate, end)
      )
    );
  }
  const where = conditions.length > 0 ? (0, import_drizzle_orm.and)(...conditions) : void 0;
  const [rows, countResult] = await Promise.all([
    db.select().from(transactions).where(where).orderBy((0, import_drizzle_orm.desc)(transactions.transactionDate)).limit(limit).offset(offset),
    db.select({ count: import_drizzle_orm.sql`COUNT(*)` }).from(transactions).where(where)
  ]);
  return {
    data: rows,
    total: Number(countResult[0]?.count ?? 0),
    page,
    limit,
    totalPages: Math.ceil(Number(countResult[0]?.count ?? 0) / limit)
  };
}
async function getTransactionsByDay(date) {
  const start = new Date(date);
  const end = new Date(date);
  end.setDate(end.getDate() + 1);
  return db.select().from(transactions).where((0, import_drizzle_orm.and)((0, import_drizzle_orm.gte)(transactions.transactionDate, start), (0, import_drizzle_orm.lte)(transactions.transactionDate, end), (0, import_drizzle_orm.isNull)(transactions.deletedAt))).orderBy((0, import_drizzle_orm.desc)(transactions.transactionDate));
}
async function getTransactionsByMonth(year, month) {
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 1);
  return db.select().from(transactions).where((0, import_drizzle_orm.and)((0, import_drizzle_orm.gte)(transactions.transactionDate, start), (0, import_drizzle_orm.lte)(transactions.transactionDate, end), (0, import_drizzle_orm.isNull)(transactions.deletedAt))).orderBy((0, import_drizzle_orm.desc)(transactions.transactionDate));
}
async function getTransactionById(id) {
  const rows = await db.select().from(transactions).where((0, import_drizzle_orm.and)((0, import_drizzle_orm.eq)(transactions.id, id), (0, import_drizzle_orm.isNull)(transactions.deletedAt)));
  return rows[0] ?? null;
}
async function createTransaction(data) {
  const rows = await db.insert(transactions).values(data).returning();
  return rows[0];
}
async function updateTransaction(id, data) {
  const rows = await db.update(transactions).set(data).where((0, import_drizzle_orm.eq)(transactions.id, id)).returning();
  return rows[0];
}
async function deleteTransaction(id, userId) {
  await db.update(transactions).set({ deletedAt: import_drizzle_orm.sql`NOW()`, deletedBy: userId }).where((0, import_drizzle_orm.eq)(transactions.id, id));
}

// src/db/queries/activity.ts
var import_drizzle_orm2 = require("drizzle-orm");
async function logActivity(data) {
  const rows = await db.insert(activityLogs).values(data).returning();
  return rows[0];
}
async function getActivities(filter = {}) {
  const { userId, action, date, page = 1, limit = 50 } = filter;
  const offset = (page - 1) * limit;
  const conditions = [];
  if (userId) {
    conditions.push((0, import_drizzle_orm2.eq)(activityLogs.userId, userId));
  }
  if (action) {
    conditions.push((0, import_drizzle_orm2.eq)(activityLogs.action, action));
  }
  const where = conditions.length > 0 ? (0, import_drizzle_orm2.and)(...conditions) : void 0;
  const rows = await db.select({
    id: activityLogs.id,
    action: activityLogs.action,
    entityType: activityLogs.entityType,
    entityId: activityLogs.entityId,
    description: activityLogs.description,
    createdAt: activityLogs.createdAt,
    user: {
      id: users.id,
      username: users.username,
      fullName: users.fullName
    }
  }).from(activityLogs).leftJoin(users, (0, import_drizzle_orm2.eq)(activityLogs.userId, users.id)).where(where).orderBy((0, import_drizzle_orm2.desc)(activityLogs.createdAt)).limit(limit).offset(offset);
  return rows;
}

// src/db/queries/targets.ts
var import_drizzle_orm3 = require("drizzle-orm");
async function getAllTargets() {
  return db.select().from(targets).orderBy((0, import_drizzle_orm3.asc)(targets.createdAt));
}
async function getTargetById(id) {
  const rows = await db.select().from(targets).where((0, import_drizzle_orm3.eq)(targets.id, id));
  return rows[0] ?? null;
}
async function createTarget(data) {
  const rows = await db.insert(targets).values(data).returning();
  return rows[0];
}
async function updateTarget(id, data) {
  const rows = await db.update(targets).set(data).where((0, import_drizzle_orm3.eq)(targets.id, id)).returning();
  return rows[0];
}
async function deleteTarget(id) {
  await db.delete(targets).where((0, import_drizzle_orm3.eq)(targets.id, id));
}

// src/db/queries/gallery.ts
var import_drizzle_orm4 = require("drizzle-orm");
async function getAllGalleryPhotos() {
  return db.select().from(galleryPhotos).orderBy((0, import_drizzle_orm4.desc)(galleryPhotos.createdAt));
}
async function getRecentGalleryPhotos(limit = 6) {
  return db.select().from(galleryPhotos).orderBy((0, import_drizzle_orm4.desc)(galleryPhotos.createdAt)).limit(limit);
}
async function getGalleryPhotoById(id) {
  const rows = await db.select().from(galleryPhotos).where((0, import_drizzle_orm4.eq)(galleryPhotos.id, id));
  return rows[0] ?? null;
}
async function createGalleryPhoto(data) {
  const rows = await db.insert(galleryPhotos).values(data).returning();
  return rows[0];
}
async function updateGalleryPhoto(id, data) {
  const rows = await db.update(galleryPhotos).set(data).where((0, import_drizzle_orm4.eq)(galleryPhotos.id, id)).returning();
  return rows[0];
}
async function deleteGalleryPhoto(id) {
  await db.delete(galleryPhotos).where((0, import_drizzle_orm4.eq)(galleryPhotos.id, id));
}

// server/services/cloudinary.ts
var import_cloudinary = require("cloudinary");
import_cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});
async function uploadToCloudinary(fileBuffer, folder = "tabungan-lia") {
  return new Promise((resolve, reject) => {
    const stream = import_cloudinary.v2.uploader.upload_stream(
      { folder, resource_type: "image" },
      (error, result) => {
        if (error || !result) {
          reject(error ?? new Error("Upload failed"));
        } else {
          resolve(result.secure_url);
        }
      }
    );
    stream.end(fileBuffer);
  });
}

// server/services/sheets.ts
var import_axios = __toESM(require("axios"));
var WEBHOOK_URL = process.env.GOOGLE_SCRIPT_URL;
async function syncTransactionToSheets(action, transaction) {
  if (!WEBHOOK_URL) {
    console.warn("[Sheets] GOOGLE_SCRIPT_URL not set, skipping sync");
    return;
  }
  try {
    await import_axios.default.post(WEBHOOK_URL, {
      action,
      id: transaction.id,
      transaction_date: transaction.transactionDate ? transaction.transactionDate.toISOString() : void 0,
      amount: transaction.amount,
      payment_method: transaction.paymentMethod,
      message: transaction.depositMessage,
      proof_url: transaction.proofUrl,
      transaction_type: transaction.transactionType,
      created_by: transaction.createdBy,
      created_at: transaction.createdAt ? transaction.createdAt.toISOString() : void 0
    });
    console.log(`[Sheets] Synced action=${action} id=${transaction.id}`);
  } catch (err) {
    console.error("[Sheets] Sync failed:", err?.message || err);
  }
}

// server/services/pdf.ts
var import_jspdf = __toESM(require("jspdf"));
var import_jspdf_autotable = __toESM(require("jspdf-autotable"));
var import_date_fns = require("date-fns");
var import_locale = require("date-fns/locale");
function formatIDR(amount) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(amount);
}
function buildPDF(title, subtitle, rows) {
  const doc = new import_jspdf.default({ orientation: "portrait", unit: "mm", format: "a4" });
  doc.setFontSize(18);
  doc.setTextColor(255, 143, 171);
  doc.text("Tabungan Lia", 14, 18);
  doc.setFontSize(12);
  doc.setTextColor(45, 45, 45);
  doc.text(title, 14, 27);
  doc.text(subtitle, 14, 34);
  const tableBody = rows.map((t) => [
    (0, import_date_fns.format)(new Date(t.transactionDate), "dd MMM yyyy", { locale: import_locale.id }),
    t.paymentMethod,
    formatIDR(t.amount),
    t.depositMessage ?? "-"
  ]);
  const total = rows.reduce((sum, t) => sum + t.amount, 0);
  (0, import_jspdf_autotable.default)(doc, {
    startY: 42,
    head: [["Tanggal", "Metode", "Jumlah", "Pesan"]],
    body: tableBody,
    foot: [["", "Total", formatIDR(total), ""]],
    theme: "striped",
    headStyles: { fillColor: [255, 143, 171], textColor: 255, fontStyle: "bold" },
    footStyles: { fillColor: [255, 229, 236], textColor: [45, 45, 45], fontStyle: "bold" },
    styles: { fontSize: 10, cellPadding: 3 },
    columnStyles: { 2: { halign: "right" } }
  });
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(
      `Generated by Tabungan Lia \u2014 Halaman ${i} dari ${pageCount}`,
      14,
      doc.internal.pageSize.height - 8
    );
  }
  return Buffer.from(doc.output("arraybuffer"));
}
function buildDailyPDF(date, rows) {
  const displayDate = (0, import_date_fns.format)(new Date(date), "dd MMMM yyyy", { locale: import_locale.id });
  return buildPDF("Laporan Harian", `Tanggal: ${displayDate}`, rows);
}
function buildMonthlyPDF(year, month, rows) {
  const displayMonth = (0, import_date_fns.format)(new Date(year, month - 1, 1), "MMMM yyyy", { locale: import_locale.id });
  return buildPDF("Laporan Bulanan", `Bulan: ${displayMonth}`, rows);
}

// server/routes/auth.ts
var import_hono = require("hono");
var import_cookie2 = require("hono/cookie");
var import_jwt2 = require("hono/jwt");
var import_bcryptjs = __toESM(require("bcryptjs"));
var import_drizzle_orm6 = require("drizzle-orm");

// server/middleware/auth.ts
var import_cookie = require("hono/cookie");
var import_jwt = require("hono/jwt");
var import_drizzle_orm5 = require("drizzle-orm");
async function authMiddleware(c, next) {
  const token = (0, import_cookie.getCookie)(c, "auth_token");
  if (!token) {
    return c.json({ error: "Unauthorized: No token provided" }, 401);
  }
  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error("JWT_SECRET is not defined");
    const payload = await (0, import_jwt.verify)(token, secret, "HS256");
    const userId = payload.sub;
    const user = await db.select().from(users).where((0, import_drizzle_orm5.eq)(users.id, userId)).limit(1);
    if (user.length === 0) {
      return c.json({ error: "Unauthorized: User not found" }, 401);
    }
    c.set("user", user[0]);
    await next();
  } catch (error) {
    (0, import_cookie.deleteCookie)(c, "auth_token");
    return c.json({ error: `Unauthorized: ${error?.message}` }, 401);
  }
}

// server/routes/auth.ts
var authRouter = new import_hono.Hono();
authRouter.post("/login", async (c) => {
  const body = await c.req.json();
  const { username, password } = body;
  if (!username || !password) {
    return c.json({ error: "Username and password are required" }, 400);
  }
  const userResult = await db.select().from(users).where((0, import_drizzle_orm6.eq)(users.username, username)).limit(1);
  const user = userResult[0];
  if (!user) {
    return c.json({ error: "Invalid credentials" }, 401);
  }
  const isValidPassword = await import_bcryptjs.default.compare(password, user.passwordHash);
  if (!isValidPassword) {
    return c.json({ error: "Invalid credentials" }, 401);
  }
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    console.error("JWT_SECRET is not set");
    return c.json({ error: "Internal server error" }, 500);
  }
  const payload = {
    sub: user.id,
    username: user.username,
    exp: Math.floor(Date.now() / 1e3) + 60 * 60 * 24 * 7
    // 7 days
  };
  const token = await (0, import_jwt2.sign)(payload, secret);
  (0, import_cookie2.setCookie)(c, "auth_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production" && !c.req.header("host")?.includes("localhost"),
    sameSite: "Lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7
  });
  const { passwordHash, ...userWithoutPassword } = user;
  return c.json(userWithoutPassword);
});
authRouter.post("/logout", async (c) => {
  (0, import_cookie2.deleteCookie)(c, "auth_token", {
    path: "/",
    secure: process.env.NODE_ENV === "production",
    sameSite: "Lax"
  });
  return c.json({ success: true });
});
authRouter.get("/me", authMiddleware, async (c) => {
  const user = c.get("user");
  const { passwordHash, ...userWithoutPassword } = user;
  return c.json(userWithoutPassword);
});
authRouter.post("/change-password", authMiddleware, async (c) => {
  const user = c.get("user");
  const body = await c.req.json();
  const { oldPassword, newPassword } = body;
  if (!oldPassword || !newPassword) {
    return c.json({ error: "Old password and new password are required" }, 400);
  }
  const isValidOldPassword = await import_bcryptjs.default.compare(oldPassword, user.passwordHash);
  if (!isValidOldPassword) {
    return c.json({ error: "Invalid old password" }, 401);
  }
  const newPasswordHash = await import_bcryptjs.default.hash(newPassword, 10);
  await db.update(users).set({ passwordHash: newPasswordHash }).where((0, import_drizzle_orm6.eq)(users.id, user.id));
  await logActivity({
    userId: user.id,
    action: "Reset Password",
    entityType: "USER",
    entityId: user.id,
    description: "User reset their password"
  });
  return c.json({ success: true });
});

// server/index.ts
var app = new import_hono2.Hono();
app.use("*", (0, import_logger.logger)());
app.use("*", (0, import_cors.cors)({
  origin: ["http://localhost:5173", "http://127.0.0.1:5173", process.env.VITE_API_BASE_URL || "http://localhost:3001"],
  credentials: true
}));
app.route("/api/auth", authRouter);
app.use("/api/*", async (c, next) => {
  if (c.req.path === "/api/health" || c.req.path === "/api/auth/login") {
    return next();
  }
  return authMiddleware(c, next);
});
app.get("/api/health", (c) => c.json({ ok: true }));
app.get("/api/stats", async (c) => {
  const stats = await getTotalSavings();
  return c.json(stats);
});
app.get("/api/transactions", async (c) => {
  const { search, day, month, year, page, limit } = c.req.query();
  const result = await getTransactions({
    search,
    day,
    month,
    year,
    page: page ? Number(page) : 1,
    limit: limit ? Number(limit) : 10
  });
  return c.json(result);
});
app.get("/api/transactions/latest", async (c) => {
  const rows = await getLatestTransactions(3);
  return c.json(rows);
});
app.get("/api/transactions/:id", async (c) => {
  const id = Number(c.req.param("id"));
  const row = await getTransactionById(id);
  if (!row) return c.json({ error: "Not found" }, 404);
  return c.json(row);
});
app.post("/api/transactions", async (c) => {
  const body = await c.req.json();
  const user = c.get("user");
  if (body.transactionType === "WITHDRAWAL") {
    const stats = await getTotalSavings();
    if (stats.totalSavings < Number(body.amount)) {
      return c.json({ error: "Insufficient balance" }, 400);
    }
  }
  const row = await createTransaction({
    amount: Number(body.amount),
    paymentMethod: body.paymentMethod,
    proofUrl: body.proofUrl ?? null,
    depositMessage: body.depositMessage ?? null,
    transactionDate: new Date(body.transactionDate),
    transactionType: body.transactionType ?? "DEPOSIT",
    createdBy: user.id
  });
  await logActivity({
    userId: user.id,
    action: `Created ${row.transactionType}`,
    entityType: "TRANSACTION",
    entityId: String(row.id),
    description: `Created transaction of amount ${row.amount}`
  });
  await syncTransactionToSheets("create", row);
  return c.json(row, 201);
});
app.put("/api/transactions/:id", async (c) => {
  const id = Number(c.req.param("id"));
  const body = await c.req.json();
  const user = c.get("user");
  const row = await updateTransaction(id, {
    amount: body.amount !== void 0 ? Number(body.amount) : void 0,
    paymentMethod: body.paymentMethod,
    proofUrl: body.proofUrl,
    depositMessage: body.depositMessage,
    transactionDate: body.transactionDate ? new Date(body.transactionDate) : void 0,
    transactionType: body.transactionType,
    updatedBy: user.id,
    updatedAt: /* @__PURE__ */ new Date()
  });
  if (!row) return c.json({ error: "Not found" }, 404);
  await logActivity({
    userId: user.id,
    action: `Updated Transaction`,
    entityType: "TRANSACTION",
    entityId: String(row.id),
    description: `Updated transaction #${row.id}`
  });
  await syncTransactionToSheets("update", row);
  return c.json(row);
});
app.delete("/api/transactions/:id", async (c) => {
  const id = Number(c.req.param("id"));
  const user = c.get("user");
  const row = await getTransactionById(id);
  if (!row) return c.json({ error: "Not found" }, 404);
  await deleteTransaction(id, user.id);
  await logActivity({
    userId: user.id,
    action: `Deleted Transaction`,
    entityType: "TRANSACTION",
    entityId: String(id),
    description: `Soft deleted transaction #${id}`
  });
  await syncTransactionToSheets("delete", row);
  return c.json({ success: true });
});
app.get("/api/targets", async (c) => {
  const rows = await getAllTargets();
  return c.json(rows);
});
app.get("/api/targets/:id", async (c) => {
  const id = Number(c.req.param("id"));
  const row = await getTargetById(id);
  if (!row) return c.json({ error: "Not found" }, 404);
  return c.json(row);
});
app.post("/api/targets", async (c) => {
  const body = await c.req.json();
  const row = await createTarget({
    title: body.title,
    targetAmount: Number(body.targetAmount),
    description: body.description ?? null
  });
  return c.json(row, 201);
});
app.put("/api/targets/:id", async (c) => {
  const id = Number(c.req.param("id"));
  const body = await c.req.json();
  const row = await updateTarget(id, {
    title: body.title,
    targetAmount: body.targetAmount !== void 0 ? Number(body.targetAmount) : void 0,
    description: body.description
  });
  if (!row) return c.json({ error: "Not found" }, 404);
  return c.json(row);
});
app.delete("/api/targets/:id", async (c) => {
  const id = Number(c.req.param("id"));
  await deleteTarget(id);
  return c.json({ success: true });
});
app.get("/api/gallery", async (c) => {
  const { limit } = c.req.query();
  const rows = limit ? await getRecentGalleryPhotos(Number(limit)) : await getAllGalleryPhotos();
  return c.json(rows);
});
app.get("/api/gallery/:id", async (c) => {
  const id = Number(c.req.param("id"));
  const row = await getGalleryPhotoById(id);
  if (!row) return c.json({ error: "Not found" }, 404);
  return c.json(row);
});
app.delete("/api/gallery/:id", async (c) => {
  const id = Number(c.req.param("id"));
  await deleteGalleryPhoto(id);
  return c.json({ success: true });
});
app.put("/api/gallery/:id", async (c) => {
  const id = Number(c.req.param("id"));
  const body = await c.req.json();
  const row = await updateGalleryPhoto(id, { caption: body.caption });
  if (!row) return c.json({ error: "Not found" }, 404);
  return c.json(row);
});
app.post("/api/upload", async (c) => {
  try {
    const body = await c.req.parseBody();
    const file = body["file"];
    if (!file) {
      return c.json({ error: "No file provided" }, 400);
    }
    const folder = body["folder"] ?? "tabungan-lia";
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const url = await uploadToCloudinary(buffer, folder);
    return c.json({ url });
  } catch (error) {
    return c.json({ error: error.message }, 500);
  }
});
app.post("/api/gallery", async (c) => {
  try {
    const body = await c.req.parseBody();
    let imageUrl;
    const file = body["file"];
    if (file) {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      imageUrl = await uploadToCloudinary(buffer, "tabungan-lia/gallery");
    } else if (body["imageUrl"] && typeof body["imageUrl"] === "string") {
      imageUrl = body["imageUrl"];
    } else {
      return c.json({ error: "No file or imageUrl provided" }, 400);
    }
    const caption = typeof body["caption"] === "string" ? body["caption"] : null;
    const row = await createGalleryPhoto({
      imageUrl,
      caption
    });
    return c.json(row, 201);
  } catch (error) {
    return c.json({ error: error.message }, 500);
  }
});
app.post("/api/transactions/with-proof", async (c) => {
  try {
    const user = c.get("user");
    const body = await c.req.parseBody();
    let proofUrl = null;
    const transactionType = body["transactionType"] ?? "DEPOSIT";
    const amount = Number(body["amount"]);
    if (transactionType === "WITHDRAWAL") {
      const stats = await getTotalSavings();
      if (stats.totalSavings < amount) {
        return c.json({ error: "Insufficient balance" }, 400);
      }
    }
    const file = body["proof"];
    if (file) {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      proofUrl = await uploadToCloudinary(buffer, "tabungan-lia/proofs");
    }
    const row = await createTransaction({
      amount,
      paymentMethod: body["paymentMethod"],
      proofUrl,
      depositMessage: body["depositMessage"] ?? null,
      transactionDate: new Date(body["transactionDate"]),
      transactionType,
      createdBy: user.id
    });
    await logActivity({
      userId: user.id,
      action: `Created ${row.transactionType} with proof`,
      entityType: "TRANSACTION",
      entityId: String(row.id),
      description: `Created transaction of amount ${row.amount}`
    });
    await syncTransactionToSheets("create", row);
    return c.json(row, 201);
  } catch (error) {
    return c.json({ error: error.message }, 500);
  }
});
app.get("/api/export/pdf/daily", async (c) => {
  const { date } = c.req.query();
  if (!date) return c.json({ error: "date param required (YYYY-MM-DD)" }, 400);
  const rows = await getTransactionsByDay(date);
  const pdfBuffer = buildDailyPDF(date, rows);
  c.header("Content-Type", "application/pdf");
  c.header("Content-Disposition", `attachment; filename="tabungan-lia-daily-${date}.pdf"`);
  return c.body(pdfBuffer);
});
app.get("/api/export/pdf/monthly", async (c) => {
  const { year, month } = c.req.query();
  if (!year || !month) return c.json({ error: "year and month params required" }, 400);
  const rows = await getTransactionsByMonth(Number(year), Number(month));
  const pdfBuffer = buildMonthlyPDF(Number(year), Number(month), rows);
  c.header("Content-Type", "application/pdf");
  c.header("Content-Disposition", `attachment; filename="tabungan-lia-${year}-${month}.pdf"`);
  return c.body(pdfBuffer);
});
app.get("/api/activity", async (c) => {
  const { userId, action, date, page, limit } = c.req.query();
  const rows = await getActivities({
    userId,
    action,
    date,
    page: page ? Number(page) : 1,
    limit: limit ? Number(limit) : 50
  });
  return c.json(rows);
});
var index_default = app;

// server/entry.ts
var entry_default = (0, import_vercel.handle)(index_default);
