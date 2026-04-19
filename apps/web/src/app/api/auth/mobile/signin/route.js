import sql from "../../../utils/sql.js";
import { verify } from "argon2";
import { SignJWT } from "jose";

const secret = new TextEncoder().encode(process.env.AUTH_SECRET);

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return Response.json(
        { error: "Email and password are required" },
        { status: 400 },
      );
    }

    // Get user by email
    const users = await sql`
      SELECT u.*, a.password 
      FROM auth_users u 
      JOIN auth_accounts a ON u.id = a."userId" 
      WHERE u.email = ${email} AND a.provider = 'credentials'
    `;

    if (users.length === 0) {
      return Response.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const user = users[0];

    // Verify password
    const isValid = await verify(user.password, password);
    if (!isValid) {
      return Response.json({ error: "Invalid credentials" }, { status: 401 });
    }

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

    return Response.json({
      success: true,
      jwt,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (error) {
    console.error("Mobile signin error:", error);
    return Response.json({ error: "Authentication failed" }, { status: 500 });
  }
}
