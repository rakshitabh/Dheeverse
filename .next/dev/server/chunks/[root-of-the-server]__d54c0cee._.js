module.exports = [
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/mongoose [external] (mongoose, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("mongoose", () => require("mongoose"));

module.exports = mod;
}),
"[project]/lib/mongodb.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "connectToDatabase",
    ()=>connectToDatabase
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$mongoose__$5b$external$5d$__$28$mongoose$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/mongoose [external] (mongoose, cjs)");
;
const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
    throw new Error("Please define the MONGODB_URI environment variable inside .env.local");
}
let cached = {
    conn: null,
    promise: null
};
async function connectToDatabase() {
    if (cached.conn) {
        console.log("Using cached MongoDB connection");
        return cached.conn;
    }
    if (!cached.promise) {
        console.log("Creating new MongoDB connection to:", MONGODB_URI?.split("@")[1] || "unknown");
        cached.promise = __TURBOPACK__imported__module__$5b$externals$5d2f$mongoose__$5b$external$5d$__$28$mongoose$2c$__cjs$29$__["default"].connect(MONGODB_URI, {
            retryWrites: true,
            w: "majority"
        }).then((mongoose)=>{
            console.log("MongoDB connected successfully");
            return mongoose;
        }).catch((error)=>{
            console.error("MongoDB connection failed:", error);
            cached.promise = null;
            throw error;
        });
    }
    try {
        cached.conn = await cached.promise;
    } catch (e) {
        cached.promise = null;
        console.error("Failed to establish cached connection:", e);
        throw e;
    }
    return cached.conn;
}
}),
"[externals]/crypto [external] (crypto, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("crypto", () => require("crypto"));

module.exports = mod;
}),
"[project]/lib/models/User.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$mongoose__$5b$external$5d$__$28$mongoose$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/mongoose [external] (mongoose, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$bcryptjs$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/bcryptjs/index.js [app-route] (ecmascript)");
;
;
const userSchema = new __TURBOPACK__imported__module__$5b$externals$5d2f$mongoose__$5b$external$5d$__$28$mongoose$2c$__cjs$29$__["Schema"]({
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        match: [
            /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
            "Please provide a valid email"
        ]
    },
    password: {
        type: String,
        required: true,
        minlength: 6,
        select: false
    },
    name: {
        type: String,
        default: "User"
    },
    avatar: {
        type: String,
        default: null
    }
}, {
    timestamps: true
});
// Hash password before saving - using async/await pattern
userSchema.pre("save", async function() {
    // Only hash if password has been modified
    if (!this.isModified("password")) {
        return;
    }
    try {
        console.log("Pre-save: Hashing password for user:", this.email);
        const salt = await __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$bcryptjs$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].genSalt(10);
        const hash = await __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$bcryptjs$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].hash(this.password, salt);
        this.password = hash;
        console.log("Pre-save: Password hashed successfully");
    } catch (error) {
        console.error("Pre-save: Password hashing failed:", error);
        throw error;
    }
});
// Method to compare password
userSchema.methods.comparePassword = async function(password) {
    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$bcryptjs$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].compare(password, this.password);
};
const __TURBOPACK__default__export__ = __TURBOPACK__imported__module__$5b$externals$5d2f$mongoose__$5b$external$5d$__$28$mongoose$2c$__cjs$29$__["default"].models.User || __TURBOPACK__imported__module__$5b$externals$5d2f$mongoose__$5b$external$5d$__$28$mongoose$2c$__cjs$29$__["default"].model("User", userSchema);
}),
"[project]/lib/models/OTP.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$mongoose__$5b$external$5d$__$28$mongoose$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/mongoose [external] (mongoose, cjs)");
;
const otpSchema = new __TURBOPACK__imported__module__$5b$externals$5d2f$mongoose__$5b$external$5d$__$28$mongoose$2c$__cjs$29$__["Schema"]({
    email: {
        type: String,
        required: true,
        lowercase: true,
        trim: true
    },
    otp: {
        type: String,
        required: true
    },
    expiresAt: {
        type: Date,
        required: true,
        default: ()=>new Date(Date.now() + 10 * 60 * 1000)
    },
    verified: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});
// Delete expired OTPs automatically
otpSchema.index({
    expiresAt: 1
}, {
    expireAfterSeconds: 0
});
const __TURBOPACK__default__export__ = __TURBOPACK__imported__module__$5b$externals$5d2f$mongoose__$5b$external$5d$__$28$mongoose$2c$__cjs$29$__["default"].models.OTP || __TURBOPACK__imported__module__$5b$externals$5d2f$mongoose__$5b$external$5d$__$28$mongoose$2c$__cjs$29$__["default"].model("OTP", otpSchema);
}),
"[externals]/events [external] (events, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("events", () => require("events"));

module.exports = mod;
}),
"[externals]/url [external] (url, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("url", () => require("url"));

module.exports = mod;
}),
"[externals]/util [external] (util, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("util", () => require("util"));

module.exports = mod;
}),
"[externals]/fs [external] (fs, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("fs", () => require("fs"));

module.exports = mod;
}),
"[externals]/http [external] (http, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("http", () => require("http"));

module.exports = mod;
}),
"[externals]/https [external] (https, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("https", () => require("https"));

module.exports = mod;
}),
"[externals]/zlib [external] (zlib, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("zlib", () => require("zlib"));

module.exports = mod;
}),
"[externals]/stream [external] (stream, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("stream", () => require("stream"));

module.exports = mod;
}),
"[externals]/net [external] (net, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("net", () => require("net"));

module.exports = mod;
}),
"[externals]/dns [external] (dns, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("dns", () => require("dns"));

module.exports = mod;
}),
"[externals]/os [external] (os, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("os", () => require("os"));

module.exports = mod;
}),
"[externals]/path [external] (path, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("path", () => require("path"));

module.exports = mod;
}),
"[externals]/tls [external] (tls, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("tls", () => require("tls"));

module.exports = mod;
}),
"[externals]/child_process [external] (child_process, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("child_process", () => require("child_process"));

module.exports = mod;
}),
"[project]/lib/email.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "generateOTP",
    ()=>generateOTP,
    "sendEmail",
    ()=>sendEmail,
    "sendOTPEmail",
    ()=>sendOTPEmail,
    "sendWelcomeEmail",
    ()=>sendWelcomeEmail
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$nodemailer$2f$lib$2f$nodemailer$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/nodemailer/lib/nodemailer.js [app-route] (ecmascript)");
;
console.log("=== Email Service Initialization ===");
console.log("EMAIL_SERVICE:", process.env.EMAIL_SERVICE);
console.log("EMAIL_USER:", process.env.EMAIL_USER);
console.log("EMAIL_PASS length:", process.env.EMAIL_PASS?.length || 0);
console.log("EMAIL_PASS first 5 chars:", process.env.EMAIL_PASS?.substring(0, 5) || "NOT SET");
console.log("EMAIL_PASS exists:", !!process.env.EMAIL_PASS);
let transporter = null;
let verificationChecked = false;
async function initializeTransporter() {
    if (transporter && verificationChecked) {
        console.log("[Cache Hit] Using cached transporter");
        return transporter;
    }
    try {
        console.log("\n[Init] Creating Nodemailer transporter...");
        console.log("[Init] Service: Gmail");
        console.log("[Init] User:", process.env.EMAIL_USER);
        console.log("[Init] Pass provided:", !!process.env.EMAIL_PASS);
        transporter = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$nodemailer$2f$lib$2f$nodemailer$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].createTransport({
            service: process.env.EMAIL_SERVICE || "gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });
        console.log("[Init] Transporter created, verifying SMTP connection...");
        const verified = await transporter.verify();
        console.log("[Init] ✓ SMTP connection verified:", verified);
        verificationChecked = true;
        return transporter;
    } catch (error) {
        console.error("[Init] ✗ Failed to initialize email transporter");
        console.error("[Init] Error type:", error instanceof Error ? error.constructor.name : typeof error);
        console.error("[Init] Error message:", String(error));
        if (error instanceof Error) {
            console.error("[Init] Error code:", error.code);
            console.error("[Init] Error response:", error.response);
        }
        verificationChecked = true;
        throw error;
    }
}
async function sendEmail({ to, subject, html }) {
    console.log("\n[Email] === Sending Email ===");
    console.log("[Email] To:", to);
    console.log("[Email] Subject:", subject);
    try {
        console.log("[Email] Initializing transporter...");
        const transporter = await initializeTransporter();
        console.log("[Email] Transporter ready, sending mail...");
        const result = await transporter.sendMail({
            from: `"DheeVerse" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            html
        });
        console.log("[Email] ✓ Email sent successfully!");
        console.log("[Email] Message ID:", result.messageId);
        return result;
    } catch (error) {
        console.error("\n[Email] ✗ Error sending email");
        console.error("[Email] Error type:", error instanceof Error ? error.constructor.name : typeof error);
        console.error("[Email] Error message:", String(error));
        if (error instanceof Error) {
            console.error("[Email] Full error:", error.message);
            console.error("[Email] Error code:", error.code);
            console.error("[Email] Error response:", error.response);
            if (error.code === 'EAUTH') {
                console.error("[Email] ⚠️  AUTHENTICATION ERROR - Check your email credentials in .env.local");
                console.error("[Email]    Email user:", process.env.EMAIL_USER);
                console.error("[Email]    Email pass length:", process.env.EMAIL_PASS?.length || 0);
            }
        }
        throw error;
    }
}
function generateOTP() {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    console.log("Generated OTP:", otp);
    return otp;
}
async function sendOTPEmail(email, otp) {
    try {
        console.log("Preparing OTP email for:", email);
        const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; border-radius: 10px; color: white; text-align: center; margin-bottom: 30px;">
          <h1 style="margin: 0; font-size: 28px;">DheeVerse</h1>
          <p style="margin: 5px 0 0 0;">Wellness Journal</p>
        </div>

        <h2 style="color: #333; text-align: center;">Email Verification</h2>
        <p style="color: #666; text-align: center;">Welcome to DheeVerse Wellness Journal!</p>
        
        <p style="color: #333; margin: 30px 0 15px 0;">Your One-Time Password (OTP) is:</p>
        <div style="background-color: #f0f0f0; padding: 30px; border-radius: 8px; text-align: center; margin: 20px 0;">
          <h1 style="color: #667eea; letter-spacing: 3px; margin: 0; font-size: 48px; font-weight: bold;">${otp}</h1>
        </div>
        
        <p style="color: #666; margin: 20px 0;">
          <strong>This OTP will expire in 10 minutes.</strong>
        </p>
        
        <p style="color: #999; font-size: 14px; margin-top: 30px;">
          If you didn't request this verification, please ignore this email and do not share this OTP with anyone.
        </p>
        
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />
        <p style="color: #999; font-size: 12px; text-align: center;">
          This is an automated email. Please do not reply to this message.
        </p>
      </div>
    `;
        const result = await sendEmail({
            to: email,
            subject: "Your OTP for DheeVerse Wellness Journal - Expires in 10 minutes",
            html
        });
        console.log("OTP email sent successfully to:", email);
        return result;
    } catch (error) {
        console.error("Failed to send OTP email:", error);
        throw error;
    }
}
async function sendWelcomeEmail(email, name) {
    try {
        console.log("Preparing welcome email for:", email);
        const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; border-radius: 10px; color: white; text-align: center; margin-bottom: 30px;">
          <h1 style="margin: 0; font-size: 28px;">DheeVerse</h1>
          <p style="margin: 5px 0 0 0;">Wellness Journal</p>
        </div>

        <h2 style="color: #333;">Welcome to DheeVerse, ${name}!</h2>
        <p style="color: #666;">Your account has been successfully verified and created.</p>
        
        <p style="color: #333; margin: 30px 0 15px 0;">Start your wellness journey today!</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${("TURBOPACK compile-time value", "http://localhost:3000")}/journal" style="background-color: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
            Open DheeVerse
          </a>
        </div>
        
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />
        <p style="color: #999; font-size: 12px; text-align: center;">
          This is an automated email. Please do not reply to this message.
        </p>
      </div>
    `;
        const result = await sendEmail({
            to: email,
            subject: "Welcome to DheeVerse Wellness Journal!",
            html
        });
        console.log("Welcome email sent successfully to:", email);
        return result;
    } catch (error) {
        console.error("Failed to send welcome email:", error);
        throw error;
    }
}
}),
"[project]/app/api/auth/signup/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "POST",
    ()=>POST
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$mongodb$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/mongodb.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$models$2f$User$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/models/User.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$models$2f$OTP$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/models/OTP.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$email$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/email.ts [app-route] (ecmascript)");
;
;
;
;
;
async function POST(req) {
    try {
        console.log("=== Signup Request Started ===");
        const { email, password } = await req.json();
        console.log("Signup data received - Email:", email);
        // Validation
        if (!email || !password) {
            console.log("Validation failed: missing email or password");
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "Email and password are required"
            }, {
                status: 400
            });
        }
        if (password.length < 6) {
            console.log("Validation failed: password too short");
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "Password must be at least 6 characters"
            }, {
                status: 400
            });
        }
        console.log("Connecting to database...");
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$mongodb$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["connectToDatabase"])();
        console.log("Database connected successfully");
        // Check if user already exists
        console.log("Checking if user already exists...");
        const existingUser = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$models$2f$User$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].findOne({
            email
        });
        if (existingUser) {
            console.log("User already exists:", email);
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "Email already registered"
            }, {
                status: 409
            });
        }
        // Create user
        console.log("Creating new user...");
        const user = new __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$models$2f$User$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"]({
            email,
            password,
            name: email.split("@")[0]
        });
        console.log("Saving user to database...");
        await user.save();
        console.log("User saved successfully with ID:", user._id);
        // Generate and save OTP
        console.log("Generating OTP...");
        const otp = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$email$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["generateOTP"])();
        console.log("OTP generated:", otp);
        await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$models$2f$OTP$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].deleteMany({
            email
        });
        console.log("Old OTPs deleted");
        await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$models$2f$OTP$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].create({
            email,
            otp,
            expiresAt: new Date(Date.now() + 10 * 60 * 1000)
        });
        console.log("OTP saved to database");
        // Send OTP email - non-blocking
        console.log("Sending OTP email...");
        let emailSent = false;
        let emailError = null;
        try {
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$email$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["sendOTPEmail"])(email, otp);
            emailSent = true;
            console.log("OTP email sent successfully");
        } catch (emailErr) {
            emailError = emailErr;
            console.error("Failed to send OTP email:", emailErr);
        }
        // Return success regardless of email status
        if (emailSent) {
            console.log("Signup completed successfully with email sent");
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                message: "User registered successfully. OTP sent to email.",
                userId: user._id,
                email: user.email
            }, {
                status: 201
            });
        } else {
            console.log("Signup completed but email failed - returning partial success");
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                message: "User created but OTP email could not be sent. Please check your email configuration and try resending OTP.",
                userId: user._id,
                email: user.email,
                emailError: String(emailError)
            }, {
                status: 201
            });
        }
    } catch (error) {
        console.error("=== Signup Error ===");
        console.error("Error type:", error instanceof Error ? error.constructor.name : typeof error);
        console.error("Error message:", String(error));
        if (error instanceof Error) {
            console.error("Error details:", error.message);
            console.error("Error stack:", error.stack);
        }
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "Internal server error",
            message: String(error)
        }, {
            status: 500
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__d54c0cee._.js.map