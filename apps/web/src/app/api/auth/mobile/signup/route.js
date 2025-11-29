import sql from "../../../utils/sql.js";
import { hash } from "argon2";
import { SignJWT } from "jose";

const secret = new TextEncoder().encode(process.env.AUTH_SECRET);

export async function POST(request) {
  try {
    const { email, password, name } = await request.json();

    if (!email || !password || !name) {
      return Response.json(
        { error: "Email, password, and name are required" },
        { status: 400 },
      );
    }

    // Check if user already exists
    const existingUsers = await sql`
      SELECT id FROM auth_users WHERE email = ${email}
    `;

    if (existingUsers.length > 0) {
      return Response.json({ error: "User already exists" }, { status: 409 });
    }

    // Hash password
    const hashedPassword = await hash(password);

    // Create user and account in a transaction
    const [user] = await sql.transaction([
      sql`
        INSERT INTO auth_users (name, email, "emailVerified", image)
        VALUES (${name}, ${email}, NULL, NULL)
        RETURNING id, name, email, "emailVerified", image
      `,
    ]);

    // Create credentials account
    await sql`
      INSERT INTO auth_accounts (
        "userId", provider, type, "providerAccountId", password
      ) VALUES (
        ${user.id}, 'credentials', 'credentials', ${user.id}, ${hashedPassword}
      )
    `;

    // Generate JWT token
    const jwt = await new SignJWT({
      sub: user.id.toString(),
      email: user.email,
      name: user.name,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("24h")
      .sign(secret);

    return Response.json(
      {
        success: true,
        jwt,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Mobile signup error:", error);
    if (error.constraint === "auth_users_email_key") {
      return Response.json({ error: "Email already exists" }, { status: 409 });
    }
    return Response.json(
      { error: "Failed to create account" },
      { status: 500 },
    );
  }
}
