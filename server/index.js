const express = require("express");
const app = express();
const cors = require("cors");
const cookieParser = require("cookie-parser");
const z = require("zod");
const jwt = require("jsonwebtoken");
const { prisma } = require("../lib/prisma");
const argon2 = require("argon2");
const { ROLES } = require("../app/utils/roles");
require("dotenv").config();
app.use(cors({ origin: "http://localhost:3000", credentials: true }));
app.use(express.json());
app.use(cookieParser());
const port = process.env.PORT;
const secret = process.env.JWT_SECRET;
const adminScret = process.env.ADMIN_SECRET;
app.post("/register", async (req, res) => {
  try {
    const { username, gmail, password } = req.body;
    const clsusername = username.trim();
    const clsgmail = gmail.trim();
    const hashpassword = await argon2.hash(password);
    const user = await prisma.user.create({
      data: {
        username: clsusername,
        gmail: clsgmail,
        password: hashpassword,
      },
    });

    return res.status(201).json({ message: "Register Success", user });
  } catch (err) {
    if (err.code === "P2002") {
      return res.status(400).json({
        message: "This name already exists.",
        code: "DUPLICATE_NAME",
        statusCode: 400,
      });
    }
    return res.status(500).json({
      message: "Server not Found",
      code: "SERVER_ERROR",
      statusCode: 500,
    });
  }
});
app.get("/user", async (req, res) => {
  try {
    const authToken = req.cookies.token;
    if (!authToken) {
      return res.status(401).json({
        message: "ยังไม่ได้ Login",
        code: "UNAUTHORIZED",
        statusCode: 401,
      });
    }
    const tokenSchema = z.object({ gmail: z.string().email() });
    const checkUser = tokenSchema.parse(jwt.verify(authToken, secret));
    const user = await prisma.user.findUnique({
      where: { gmail: checkUser.gmail },
    });
    if (!user) {
      return res.status(404).json({ message: "User not Found" });
    }
    return res.json(user);
  } catch {
    return res.status(500).json({
      message: "Server not Found",
      code: "SERVER_ERROR",
      statusCode: 500,
    });
  }
});
app.post("/login", async (req, res) => {
  try {
    const { gmail, password } = req.body;
    const userData = await prisma.user.findUnique({ where: { gmail: gmail } });
    if (!userData) {
      return res.status(400).json({
        message: "Error Fail worng Gmail or Password",
        code: "INVALID_CREDENTIALS",
        statusCode: 400,
      });
    }
    const math = await argon2.verify(userData.password, password);
    if (!math) {
      return res.status(400).json({
        message: "Error Fail worng Gmail or Password",
        code: "INVALID_CREDENTIALS",
        statusCode: 400,
      });
    }
    const token = jwt.sign(
      { id: userData.id, gmail: userData.gmail, role: userData.role },
      secret,
      { expiresIn: "1h" },
    );
    res.cookie("token", token, {
      maxAge: 3600000,
      secure: false,
      httpOnly: true,
      sameSite: "lax",
    });
    return res.status(201).json({ message: "Login Success" });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      message: "Server not Found",
      code: "SERVER_ERROR",
      statusCode: 500,
    });
  }
});
app.get("/menu", async (req, res) => {
  try {
    const menu = await prisma.menu.findMany({
      select: { id: true, name: true, price: true, stock: true, type: true },
    });
    return res.json(menu);
  } catch {
    return res.status(500).json({
      message: "Server not Found",
      code: "SERVER_ERROR",
      statusCode: 500,
    });
  }
});
app.post("/menu", async (req, res) => {
  try {
    const { name, price, type, stock } = req.body;
    const authToken = req.cookies.token;
    if (!authToken) {
      return res.status(401).json({
        message: "ยังไม่ได้ Login",
        code: "UNAUTHORIZED",
        statusCode: 401,
      });
    }
    const authSchema = z.object({ gmail: z.string().email() });
    const checkUser = authSchema.parse(jwt.verify(authToken, secret));
    const admin = await prisma.admin.findUnique({
      where: { gmail: checkUser.gmail },
    });
    if (!admin) {
      return res.status(404).json({ message: "User not Found" });
    }
    const menu = await prisma.menu.create({
      data: {
        name,
        price,
        type,
        stock,
      },
    });
    console.log(menu);
    return res.status(201).json({ message: "Post Success", menu });
  } catch (err) {
    if (err.code === "CONTRACT.NAME_DUPLICATE") {
      return res.status(400).json({
        message: "This name already exists.",
        code: "DUPLICATE_NAME",
        statusCode: 400,
      });
    }
    console.log(err);
    return res.status(500).json({
      message: "Server not Found",
      code: "SERVER_ERROR",
      statusCode: 500,
    });
  }
});
app.get("/buy", async (req, res) => {
  try {
    const authToken = req.cookies.token;
    const search = req.query.search;
    const sort = req.query.sort === "desc" ? "desc" : "asc";
    if (!authToken) {
      return res.status(401).json({
        message: "ยังไม่ได้ Login",
        code: "UNAUTHORIZED",
        statusCode: 401,
      });
    }
    const tokenSchema = z.object({ gmail: z.string().email() });
    const checkUser = tokenSchema.parse(jwt.verify(authToken, secret));
    await prisma.user.findUnique({ where: { gmail: checkUser.gmail } });
    const post = await prisma.buy.findMany({
      where: {
        item: { some: { menu: { name: { contains: search } } } },
      },
      orderBy: { createdAt: sort },
      select: {
        id: true,
        createdAt: true,
        status: true,
        updateAt: true,
        item: {
          select: {
            quantity: true,
            details: true,
            menu: {
              select: {
                id: true,
                name: true,
                price: true,
                stock: true,
                type: true,
              },
            },
          },
        },
      },
    });
    return res.json(post);
  } catch {
    return res.status(500).json({
      message: "Server not Found",
      code: "SERVER_ERROR",
      statusCode: 500,
    });
  }
});
app.post("/buy", async (req, res) => {
  try {
    const { item } = req.body;
    if (!item || item.length === 0) {
      return res
        .status(400)
        .json({ message: "เลือก Product อย่างน้อย 1 รายการ" });
    }
    const authToken = req.cookies.token;
    if (!authToken) {
      return res.status(401).json({
        message: "ยังไม่ได้ Login",
        code: "UNAUTHORIZED",
        statusCode: 401,
      });
    }
    const tokenSchema = z.object({ gmail: z.string().email() });
    const checkToken = tokenSchema.parse(jwt.verify(authToken, secret));
    const user = await prisma.user.findUnique({
      where: { gmail: checkToken.gmail },
    });
    if (!user) {
      return res.status(404).json({ message: "User not Found" });
    }
    const result = await prisma.$transaction(async (tx) => {
      for (const menuItem of item) {
        const menu = await tx.menu.findUnique({
          where: { id: menuItem.menuId },
        });
        if (menu.stock < menuItem.quantity) {
          return res
            .status(400)
            .json(`เมนู ${menu.name} สินค้าไม่พอสินค้าเหลือแค่ ${menu.stock}`);
        }
      }
      for (const menuItem of item) {
        await tx.menu.update({
          where: { id: menuItem.menuId },
          data: {
            stock: {
              decrement: menuItem.quantity,
            },
          },
        });
      }
      const menuItem = [];
      for (const i of item) {
        menuItem.push({
          menuId: Number(i.menuId),
          quantity: Number(i.quantity ?? 1),
          details: i.details,
        });
      }
      await tx.buy.create({
        data: {
          item: { create: menuItem },
          status: "Waiting",
          userId: user.id,
        },
      });
    });
    return res.status(201).json({ message: "Post Success", result });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      message: "Server not Found",
      code: "SERVER_ERROR",
      statusCode: 500,
    });
  }
});
app.delete("/buy/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const userId = Number(id);
    await prisma.buy.delete({ where: { id: userId } });
    return res.status(200).json({ ok: true });
  } catch {
    return res.status(500).json({
      message: "Server not Found",
      code: "SERVER_ERROR",
      statusCode: 500,
    });
  }
});
app.post("/admin/register", async (req, res) => {
  try {
    const { username, gmail, password } = req.body;
    const clsUsername = username.trim();
    const clsGmail = gmail.trim();
    const hashPassword = await argon2.hash(password);
    const admin = await prisma.admin.create({
      data: {
        username: clsUsername,
        gmail: clsGmail,
        password: hashPassword,
        role: "PRODUCT_MANAGER",
      },
    });
    return res.status(201).json({ message: "Post Success", admin });
  } catch (err) {
    console.log(err);
    if (err.code === "P2002") {
      return res.status(400).json({
        message: "This name already exists.",
        code: "DUPLICATE_NAME",
        statusCode: 400,
      });
    }
    return res.status(500).json({
      message: "Server not Found",
      code: "SERVER_ERROR",
      statusCode: 500,
    });
  }
});
app.post("/admin/login", async (req, res) => {
  try {
    const { gmail, password } = req.body;
    const adminData = await prisma.admin.findUnique({
      where: { gmail: gmail },
    });
    if (!adminData) {
      return res.status(400).json({
        message: "Error Fail worng Gmail or Password",
        code: "INVALID_CREDENTIALS",
        statusCode: 400,
      });
    }
    const math = await argon2.verify(adminData.password, password);
    if (!math) {
      return res.status(400).json({
        message: "Error Fail worng Gmail or Password",
        code: "INVALID_CREDENTIALS",
        statusCode: 400,
      });
    }
    const token = jwt.sign(
      { id: adminData.id, gmail: adminData.gmail, role: adminData.role },
      adminScret,
      { expiresIn: "1h" },
    );
    res.cookie("admin_token", token, {
      maxAge: 3600000,
      secure: false,
      httpOnly: true,
      sameSite: "lax",
    });
    return res.json({ message: "Login Success" });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      message: "Server not Found",
      code: "SERVER_ERROR",
      statusCode: 500,
    });
  }
});
app.get("/admins", async (req, res) => {
  try {
    const authToken = req.cookies.admin_token;
    if (!authToken) {
      return res.status(401).json({
        message: "ยังไม่ได้ Login",
        code: "UNAUTHORIZED",
        statusCode: 401,
      });
    }
    const tokenSchema = z.object({ gmail: z.string().email() });
    const checkAdmin = tokenSchema.parse(jwt.verify(authToken, adminScret));
    const admin = await prisma.admin.findUnique({
      where: { gmail: checkAdmin.gmail },
    });
    if (!admin) {
      return res.status(404).json({ message: "User not Found" });
    }
    if (admin.role !== ROLES.ADMIN) {
      return res.status(401).json({
        message: "สิทธิ์ของคุณยังไม่ถึง",
        code: "FORBIDDEN",
        statusCode: 401,
      });
    }
    const admins = await prisma.admin.findMany({
      select: { id: true, username: true, gmail: true, role: true },
    });
    return res.json(admins);
  } catch {
    return res.status(500).json({
      message: "Server not Found",
      code: "SERVER_ERROR",
      statusCode: 500,
    });
  }
});
app.patch("/admin/:id", async (req, res) => {
  try {
    const { role } = req.body;
    const { id } = req.params;
    const authToken = req.cookies.admin_token;
    if (!authToken) {
      return res.status(401).json({
        message: "ยังไม่ได้ Login",
        code: "UNAUTHORIZED",
        statusCode: 401,
      });
    }
    const tokenSchema = z.object({ gmail: z.string().email() });
    const checkAdmin = tokenSchema.parse(jwt.verify(authToken, adminScret));
    const admin = await prisma.admin.findUnique({
      where: { gmail: checkAdmin.gmail },
    });
    if (!admin) {
      return res.status(404).json({ message: "User not Found" });
    }
    if (admin.role !== ROLES.ADMIN) {
      return res.status(401).json({
        message: "สิทธิ์ของคุณยังไม่ถึง",
        code: "FORBIDDEN",
        statusCode: 401,
      });
    }
    const admins = await prisma.admin.update({
      where: { id: Number(id) },
      data: { role },
    });
    return res.json(admins);
  } catch {
    return res.status(500).json({
      message: "Server not Found",
      code: "SERVER_ERROR",
      statusCode: 500,
    });
  }
});
app.get("/admin/user", async (req, res) => {
  try {
    const authToken = req.cookies.admin_token;
    if (!authToken) {
      return res.status(401).json({
        message: "ยังไม่ได้ Login",
        code: "UNAUTHORIZED",
        statusCode: 401,
      });
    }
    const tokenSchema = z.object({ gmail: z.string().email() });
    const checkUser = tokenSchema.parse(jwt.verify(authToken, adminScret));
    const admin = await prisma.admin.findUnique({
      where: { gmail: checkUser.gmail },
    });
    if (!admin) {
      return res.status(404).json({ message: "User not Found" });
    }
    return res.json(admin);
  } catch {
    return res.status(500).json({
      message: "Server not Found",
      code: "SERVER_ERROR",
      statusCode: 500,
    });
  }
});
app.get("/admin/users", async (req, res) => {
  try {
    const authToken = req.cookies.admin_token;
    if (!authToken) {
      return res.status(401).json({
        message: "ยังไม่ได้ Login",
        code: "UNAUTHORIZED",
        statusCode: 401,
      });
    }
    const authSchema = z.object({ gmail: z.string().email() });
    const checkUser = authSchema.parse(jwt.verify(authToken, adminScret));
    const admin = await prisma.admin.findUnique({
      where: { gmail: checkUser.gmail },
    });
    if (!admin) {
      return res.status(404).json({ message: "User not Found" });
    }
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        gmail: true,
        buy: {
          select: {
            id: true,
            status: true,
            createdAt: true,
            updateAt: true,
            item: {
              select: {
                quantity: true,
                details: true,
                menu: {
                  select: {
                    id: true,
                    name: true,
                    price: true,
                    stock: true,
                    type: true,
                  },
                },
              },
            },
          },
        },
      },
    });
    if (users.length === 0) {
      return res.json(404).status({ message: "User not Found" });
    }
    return res.json(users);
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      message: "Server not Found",
      code: "SERVER_ERROR",
      statusCode: 500,
    });
  }
});
app.patch("/admin/assign-role", async (req, res) => {
  try {
    const { role, adminId } = req.body;
    const authToken = req.cookies.admin_token;
    if (!authToken) {
      return res.status(401).json({
        message: "ยังไม่ได้ Login",
        code: "UNAUTHORIZED",
        statusCode: 401,
      });
    }
    const tokenSchema = z.object({ gmail: z.string().email() });
    const checkAdmin = tokenSchema.parse(jwt.verify(authToken, adminScret));
    const admin = await prisma.admin.findUnique({
      where: { gmail: checkAdmin.gmail },
    });
    if (ROLES.ADMIN !== admin.role) {
      return res.status(401).json({
        message: "สิทธิ์ของคุณยังไม่ถึง",
        code: "FORBIDDEN",
        statusCode: 401,
      });
    }
    const adminRole = await prisma.admin.update({
      where: { id: adminId },
      data: {
        role: role,
      },
    });
    return res.json({ message: "Update Success", adminRole });
  } catch {
    return res.status(500).json({
      message: "Server not Found",
      code: "SERVER_ERROR",
      statusCode: 500,
    });
  }
});
app.put("/admin/menu/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price, stock, type } = req.body;
    const authToken = req.cookies.admin_token;
    if (!authToken) {
      return res.status(401).json({
        message: "ยังไม่ได้ Login",
        code: "UNAUTHORIZED",
        statusCode: 401,
      });
    }
    const allowRole = ["ADMIN", "PRODUCT_MANAGER"];
    const authSchema = z.object({ gmail: z.string().email() });
    const checkToken = authSchema.parse(jwt.verify(authToken, adminScret));
    const admin = await prisma.admin.findUnique({
      where: { gmail: checkToken.gmail },
    });
    if (!allowRole.includes(admin.role)) {
      return res.status(401).json({
        message: "สิทธิ์ของคุณยังไม่ถึง",
        code: "FORBIDDEN",
        statusCode: 401,
      });
    }
    const UpdateMenu = await prisma.menu.update({
      where: { id: Number(id) },
      data: { name, price, stock, type },
    });
    return res.json({ message: "Update Success", UpdateMenu });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      message: "Server not Found",
      code: "SERVER_ERROR",
      statusCode: 500,
    });
  }
});
app.patch("/admin/buy/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const authToken = req.cookies.admin_token;
    if (!authToken) {
      return res.status(401).json({
        message: "ยังไม่ได้ Login",
        code: "UNAUTHORIZED",
        statusCode: 401,
      });
    }
    const allowRole = ["ADMIN", "PRODUCT_MANAGER"];
    const authSchema = z.object({ gmail: z.string().email() });
    const checkToken = authSchema.parse(jwt.verify(authToken, adminScret));
    const admin = await prisma.admin.findUnique({
      where: { gmail: checkToken.gmail },
    });
    if (!allowRole.includes(admin.role)) {
      return res.status(401).json({
        message: "สิทธิ์ของคุณยังไม่ถึง",
        code: "FORBIDDEN",
        statusCode: 401,
      });
    }
    const UpdateStatus = await prisma.buy.update({
      where: { id: Number(id) },
      data: { status },
    });
    return res.json({ message: "Update Success", UpdateStatus });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      message: "Server not Found",
      code: "SERVER_ERROR",
      statusCode: 500,
    });
  }
});
app.get("/api/user/role", async (req, res) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({
        authenticated: false,
      });
    }
    const checkToken = jwt.verify(token, secret);
    const user = await prisma.user.findUnique({
      where: { id: Number(checkToken.id) },
      select: { id: true, gmail: true, role: true },
    });
    if (!user) {
      return res.status(401).json({ authenticated: false });
    }
    return res.json({ authenticated: true, role: user.role, user });
  } catch (err) {
    if (err.name === "TokenExpiredError" || err.name === "JsonWebTokenError") {
      return res.status(401).json({ authenticated: false });
    }

    return res.status(500).json({
      message: "Server not Found",
      code: "SERVER_ERROR",
      statusCode: 500,
    });
  }
});
app.get("/api/admin/role", async (req, res) => {
  try {
    const token = req.cookies.admin_token;
    if (!token) {
      return res.status(401).json({ authenticated: false });
    }

    const checkToken = jwt.verify(token, adminScret);
    const admin = await prisma.admin.findUnique({
      where: { id: Number(checkToken.id) },
      select: {
        id: true,
        gmail: true,
        role: true,
      },
    });

    if (!admin) {
      return res.status(401).json({ authenticated: false });
    }
    return res.json({ authenticated: true, role: admin.role, admin });
  } catch (err) {
    if (err.name === "TokenExpiredError" || err.name === "JsonWebTokenError") {
      return res.status(401).json({ authenticated: false });
    }

    return res.status(500).json({
      message: "Server not Found",
      code: "SERVER_ERROR",
      statusCode: 500,
    });
  }
});
app.post("/logout", async (req, res) => {
  try {
    res.clearCookie("token", {
      secure: false,
      httpOnly: true,
      sameSite: "lax",
    });
    return res.status(200).json({ message: "LogOut Success" });
  } catch (err) {
    res.status(500).json({
      message: "Server not Found",
      code: "SERVER_ERROR",
      statusCode: 500,
    });
  }
});
app.post("/admin/logout", async (req, res) => {
  try {
    res.clearCookie("admin_token", {
      secure: false,
      httpOnly: true,
      sameSite: "lax",
    });
    return res.status(200).json({ message: "LogOut Success" });
  } catch (err) {
    res.status(500).json({
      message: "Server not Found",
      code: "SERVER_ERROR",
      statusCode: 500,
    });
  }
});
app.listen(port, () => {
  console.log("http server is running at " + port);
});
