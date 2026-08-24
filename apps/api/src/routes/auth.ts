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
  googleAuthSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  parseBody,
} from "../validators";
import { env } from "../config/env";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";

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
      if (user.googleId) {
        throw new AppError("This account uses Gmail. Continue with Google.", 401);
      }
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
  "/google",
  asyncHandler(async (req, res) => {
    const { idToken } = parseBody(googleAuthSchema, req.body);
    if (!env.googleClientIds.length) {
      throw new AppError("Google sign-in is not configured on the server", 503);
    }

    const client = new OAuth2Client();
    let payload: {
      sub?: string;
      email?: string;
      email_verified?: boolean | string;
      given_name?: string;
      family_name?: string;
      picture?: string;
      aud?: string;
    };
    try {
      const ticket = await client.verifyIdToken({
        idToken,
        audience: env.googleClientIds,
      });
      payload = ticket.getPayload() ?? {};
    } catch {
      throw new AppError("Invalid Google token. Try Gmail again.", 401);
    }

    const googleId = payload.sub;
    const email = payload.email?.toLowerCase();
    if (!googleId || !email) {
      throw new AppError("Google did not return an email address", 400);
    }
    if (payload.email_verified === false || payload.email_verified === "false") {
      throw new AppError("Please verify your Gmail account first", 401);
    }

    let user =
      (await User.findOne({ googleId }).select("+refreshToken")) ||
      (await User.findOne({ email }).select("+refreshToken"));

    if (user && !user.isActive) {
      throw new AppError("This account is disabled", 401);
    }

    if (!user) {
      const hashed = await bcrypt.hash(crypto.randomBytes(32).toString("hex"), 12);
      user = await User.create({
        email,
        password: hashed,
        firstName: payload.given_name?.trim() || email.split("@")[0],
        lastName: payload.family_name?.trim() || "Customer",
        avatar: payload.picture,
        role: "CUSTOMER",
        googleId,
        isVerified: true,
        isActive: true,
      });
    } else if (!user.googleId) {
      user.googleId = googleId;
      if (payload.picture && !user.avatar) user.avatar = payload.picture;
      user.isVerified = true;
      await user.save();
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

    res.json({
      success: true,
      data: { user: sanitizeUser(user), tokens },
      message: "Logged in with Gmail",
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
