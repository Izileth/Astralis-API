"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const passport_1 = __importDefault(require("passport"));
const passport_google_oauth20_1 = require("passport-google-oauth20");
const passport_discord_1 = require("passport-discord");
const client_1 = require("../prisma/client");
const slugfy_1 = require("../utils/slugfy");
// Helper to generate a unique slug
const generateUniqueSlug = (name) => __awaiter(void 0, void 0, void 0, function* () {
    const slugBase = (0, slugfy_1.slugify)(name);
    let slug = slugBase;
    let count = 1;
    while (yield client_1.prisma.user.findUnique({ where: { slug } })) {
        slug = `${slugBase}-${count++}`;
    }
    return slug;
});
const handleProviderLogin = (profile, done) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d;
    try {
        const email = profile.email || ((_b = (_a = profile.emails) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.value);
        if (!email) {
            return done(new Error("Email not provided by the authentication provider."));
        }
        // 1. Find existing account
        const existingAccount = yield client_1.prisma.account.findUnique({
            where: {
                provider_providerAccountId: {
                    provider: profile.provider,
                    providerAccountId: profile.id,
                },
            },
            include: { user: true },
        });
        if (existingAccount) {
            return done(null, existingAccount.user);
        }
        // 2. Find existing user by email
        let user = yield client_1.prisma.user.findUnique({ where: { email } });
        // 3. If no user, create a new one
        if (!user) {
            const slug = yield generateUniqueSlug(profile.displayName);
            user = yield client_1.prisma.user.create({
                data: {
                    name: profile.displayName,
                    email,
                    slug,
                    avatarUrl: (_d = (_c = profile.photos) === null || _c === void 0 ? void 0 : _c[0]) === null || _d === void 0 ? void 0 : _d.value,
                    verified: true, // Automatically verify users from social logins
                },
            });
        }
        // 4. Create the account and link it to the user
        yield client_1.prisma.account.create({
            data: {
                userId: user.id,
                provider: profile.provider,
                providerAccountId: profile.id,
            },
        });
        return done(null, user);
    }
    catch (error) {
        return done(error);
    }
});
// Google Strategy
passport_1.default.use(new passport_google_oauth20_1.Strategy({
    clientID: process.env.GOOGLE_CLIENT_ID || "YOUR_GOOGLE_CLIENT_ID",
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || "YOUR_GOOGLE_CLIENT_SECRET",
    callbackURL: process.env.GOOGLE_CALLBACK_URL || "/api/auth/google/callback",
}, (accessToken, refreshToken, profile, done) => {
    handleProviderLogin(profile, done);
}));
// Discord Strategy
passport_1.default.use(new passport_discord_1.Strategy({
    clientID: process.env.DISCORD_CLIENT_ID || "YOUR_DISCORD_CLIENT_ID",
    clientSecret: process.env.DISCORD_CLIENT_SECRET || "YOUR_DISCORD_CLIENT_SECRET",
    callbackURL: process.env.DISCORD_CALLBACK_URL || "/api/auth/discord/callback",
    scope: ["identify", "email"],
}, (accessToken, refreshToken, profile, done) => {
    handleProviderLogin(profile, done);
}));
// Serialize user into the session
passport_1.default.serializeUser((user, done) => {
    done(null, user.id);
});
// Deserialize user from the session
passport_1.default.deserializeUser((id, done) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield client_1.prisma.user.findUnique({ where: { id } });
        done(null, user);
    }
    catch (error) {
        done(error, null);
    }
}));
exports.default = passport_1.default;
