
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as DiscordStrategy } from "passport-discord";
import { prisma } from "../prisma/client";
import { slugify } from "../utils/slugfy";


// Helper to generate a unique slug
const generateUniqueSlug = async (name: string): Promise<string> => {
  const slugBase = slugify(name);
  let slug = slugBase;
  let count = 1;
  while (await prisma.user.findUnique({ where: { slug } })) {
    slug = `${slugBase}-${count++}`;
  }
  return slug;
};

const handleProviderLogin = async (
  profile: passport.Profile,
  done: (error: any, user?: any) => void
) => {
  try {
    const email = (profile as any).email || profile.emails?.[0]?.value;
    if (!email) {
      return done(
        new Error("Email not provided by the authentication provider.")
      );
    }

    // 1. Find existing account
    const existingAccount = await prisma.account.findUnique({
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
    let user = await prisma.user.findUnique({ where: { email } });

    // 3. If no user, create a new one
    if (!user) {
      const slug = await generateUniqueSlug(profile.displayName);
      user = await prisma.user.create({
        data: {
          name: profile.displayName,
          email,
          slug,
          avatarUrl: profile.photos?.[0]?.value,
          verified: true, // Automatically verify users from social logins
        },
      });
    }

    // 4. Create the account and link it to the user
    await prisma.account.create({
      data: {
        userId: user.id,
        provider: profile.provider,
        providerAccountId: profile.id,
      },
    });

    return done(null, user);
  } catch (error) {
    return done(error);
  }
};

// Google Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID || "YOUR_GOOGLE_CLIENT_ID",
      clientSecret:
        process.env.GOOGLE_CLIENT_SECRET || "YOUR_GOOGLE_CLIENT_SECRET",
      callbackURL:
        process.env.GOOGLE_CALLBACK_URL || "/api/auth/google/callback",
    },
    (accessToken, refreshToken, profile, done) => {
      handleProviderLogin(profile, done);
    }
  )
);

// Discord Strategy
passport.use(
  new DiscordStrategy(
    {
      clientID: process.env.DISCORD_CLIENT_ID || "YOUR_DISCORD_CLIENT_ID",
      clientSecret:
        process.env.DISCORD_CLIENT_SECRET || "YOUR_DISCORD_CLIENT_SECRET",
      callbackURL:
        process.env.DISCORD_CALLBACK_URL || "/api/auth/discord/callback",
      scope: ["identify", "email"],
    },
    (accessToken, refreshToken, profile, done) => {
      handleProviderLogin(profile, done);
    }
  )
);

// Serialize user into the session
passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

// Deserialize user from the session
passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await prisma.user.findUnique({ where: { id } });
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

export default passport;

