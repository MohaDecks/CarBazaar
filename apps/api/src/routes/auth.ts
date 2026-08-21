import { Router } from "express";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { User } from "../models";
import {
  authenticate,
  AuthRequest,
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
} from "../middleware/auth";
import { asyncHandler, AppError } from "../middleware/error";
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  parseBody,
} from "../validators";
import { env } from "../config/env";
import jwt from "jsonwebtoken";

const router = Router();

function sanitizeUser(user: InstanceType<typeof User>) {
  return {
    _id: user._id,
    email: user.email,
    phone: user.phone,
    firstName: user.firstName,
    lastName: user.lastName,
    avatar: user.avatar,
    role: user.role,
    isVerified: user.isVerified,
    isActive: user.isActive,
    dealerId: user.dealerId,
    location: user.location,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

router.post(
  "/register",
  asyncHandler(async (req, res) => {
    const data = parseBody(registerSchema, req.body);

    const existing = await User.findOne({ email: data.email });
    if (existing) {
      throw new AppError("An account with this email already exists", 409);
    }

    const hashed = await bcrypt.hash(data.password, 12);
    const user = await User.create({
      ...data,
      password: hashed,
      isVerified: true, // email verification can be enabled later
    });

    const payload = {
      userId: user._id.toString(),
      role: user.role,
      email: user.email,
    };

    const tokens = {
      accessToken: signAccessToken(payload),
      refreshToken: signRefreshToken(payload),
    };

    user.refreshToken = tokens.refreshToken;
    await user.save();

    res.status(201).json({
      success: true,
      data: { user: sanitizeUser(user), tokens },
      message: "Account created successfully",
    });
  })
);

router.post(
  "/login",
  asyncHandler(async (req, res) => {
    const data = parseBody(loginSchema, req.body);

    const user = await User.findOne({ email: data.email }).select(
      "+password +refreshToken"
    );
    if (!user || !user.isActive) {
      throw new AppError("Invalid email or password", 401);
    }

    const valid = await bcrypt.compare(data.password, user.password);
    if (!valid) {
      throw new AppError("Invalid email or password", 401);
    }

    const payload = {
      userId: user._id.toString(),
      role: user.role,
      email: user.email,
    };

    const tokens = {
      accessToken: signAccessToken(payload),
      refreshToken: signRefreshToken(payload),
    };

    user.refreshToken = tokens.refreshToken;
    await user.save();

    res.json({
      success: true,
      data: { user: sanitizeUser(user), tokens },
      message: "Logged in successfully",
    });
  })
);

router.post(
  "/refresh",
  asyncHandler(async (req, res) => {
    const { refreshToken } = req.body as { refreshToken?: string };
    if (!refreshToken) {
      throw new AppError("Refresh token required", 401);
    }

    let payload: { userId: string; role: string; email: string };
    try {
      payload = jwt.verify(refreshToken, env.jwt.refreshSecret) as typeof payload;
    } catch {
      throw new AppError("Invalid refresh token", 401);
    }

    const user = await User.findById(payload.userId).select("+refreshToken");
    if (!user || user.refreshToken !== refreshToken || !user.isActive) {
      throw new AppError("Invalid refresh token", 401);
    }

    const authPayload = {
      userId: user._id.toString(),
      role: user.role,
      email: user.email,
    };

    const tokens = {
      accessToken: signAccessToken(authPayload),
      refreshToken: signRefreshToken(authPayload),
    };

    user.refreshToken = tokens.refreshToken;
    await user.save();

    res.json({ success: true, data: { tokens } });
  })
);

router.post(
  "/logout",
  authenticate,
  asyncHandler(async (req: AuthRequest, res) => {
    await User.findByIdAndUpdate(req.user!.userId, {
      $unset: { refreshToken: 1 },
    });
    res.json({ success: true, message: "Logged out successfully" });
  })
);

router.get(
  "/me",
  authenticate,
  asyncHandler(async (req: AuthRequest, res) => {
    const user = await User.findById(req.user!.userId);
    if (!user) throw new AppError("User not found", 404);
    res.json({ success: true, data: sanitizeUser(user) });
  })
);

router.post(
  "/forgot-password",
  asyncHandler(async (req, res) => {
    const data = parseBody(forgotPasswordSchema, req.body);
    const user = await User.findOne({ email: data.email });

    // Always return success to prevent email enumeration
    if (user) {
      const token = crypto.randomBytes(32).toString("hex");
      user.resetPasswordToken = crypto
        .createHash("sha256")
        .update(token)
        .digest("hex");
      user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000);
      await user.save();

      // In production, send email. In dev, return token for testing.
      if (env.isDev) {
        return res.json({
          success: true,
          message: "Password reset token generated",
          data: { resetToken: token },
        });
      }
    }

    res.json({
      success: true,
      message: "If an account exists, a reset link has been sent",
    });
  })
);

router.post(
  "/reset-password",
  asyncHandler(async (req, res) => {
    const data = parseBody(resetPasswordSchema, req.body);
    const hashed = crypto.createHash("sha256").update(data.token).digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashed,
      resetPasswordExpires: { $gt: new Date() },
    }).select("+resetPasswordToken +resetPasswordExpires");

    if (!user) {
      throw new AppError("Invalid or expired reset token", 400);
    }

    user.password = await bcrypt.hash(data.password, 12);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ success: true, message: "Password updated successfully" });
  })
);

export default router;
