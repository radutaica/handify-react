import sql from "../../../utils/sql.js";

export async function POST(request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return Response.json({ error: "Email is required" }, { status: 400 });
    }

    // Check if user exists
    const users = await sql`
      SELECT id, email FROM auth_users WHERE email = ${email}
    `;

    // Always return success for security reasons (don't reveal if email exists)
    if (users.length > 0) {
      // TODO: Implement actual email sending logic here
      // For now, we'll just log that a password reset was requested
      console.log(`Password reset requested for: ${email}`);

      // In a real implementation, you would:
      // 1. Generate a secure reset token
      // 2. Store it in database with expiration
      // 3. Send email with reset link
    }

    return Response.json({
      success: true,
      message:
        "If an account with that email exists, we sent you a password reset link.",
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    return Response.json(
      { error: "Failed to process request" },
      { status: 500 },
    );
  }
}
