import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

export async function PUT(request) {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      first_name,
      last_name,
      phone,
      user_type = "customer",
      location_address,
      location_city,
      location_state,
      location_zip,
    } = body;

    const userId = session.user.id;

    // Check if user already exists in our ServiceHub users table
    const existingUser = await sql`
      SELECT id FROM users WHERE id = ${userId}
    `;

    if (existingUser.length === 0) {
      // Create new user in ServiceHub users table
      const result = await sql`
        INSERT INTO users (
          id, 
          email, 
          first_name, 
          last_name, 
          phone, 
          user_type,
          location_address,
          location_city,
          location_state,
          location_zip,
          verified,
          active
        ) VALUES (
          ${userId},
          ${session.user.email},
          ${first_name || ""},
          ${last_name || ""},
          ${phone || ""},
          ${user_type},
          ${location_address || ""},
          ${location_city || ""},
          ${location_state || ""},
          ${location_zip || ""},
          true,
          true
        ) RETURNING *
      `;

      return Response.json({
        success: true,
        user: result[0],
        message: "Profile created successfully",
      });
    } else {
      // Update existing user
      const setClauses = [];
      const values = [];

      if (first_name) {
        setClauses.push(`first_name = $${values.length + 1}`);
        values.push(first_name);
      }
      if (last_name) {
        setClauses.push(`last_name = $${values.length + 1}`);
        values.push(last_name);
      }
      if (phone) {
        setClauses.push(`phone = $${values.length + 1}`);
        values.push(phone);
      }
      if (user_type) {
        setClauses.push(`user_type = $${values.length + 1}`);
        values.push(user_type);
      }
      if (location_address) {
        setClauses.push(`location_address = $${values.length + 1}`);
        values.push(location_address);
      }
      if (location_city) {
        setClauses.push(`location_city = $${values.length + 1}`);
        values.push(location_city);
      }
      if (location_state) {
        setClauses.push(`location_state = $${values.length + 1}`);
        values.push(location_state);
      }
      if (location_zip) {
        setClauses.push(`location_zip = $${values.length + 1}`);
        values.push(location_zip);
      }

      if (setClauses.length === 0) {
        return Response.json(
          { error: "No valid fields to update" },
          { status: 400 },
        );
      }

      // Add updated_at
      setClauses.push(`updated_at = NOW()`);

      const updateQuery = `
        UPDATE users 
        SET ${setClauses.join(", ")} 
        WHERE id = $${values.length + 1} 
        RETURNING *
      `;

      const result = await sql(updateQuery, [...values, userId]);

      return Response.json({
        success: true,
        user: result[0],
        message: "Profile updated successfully",
      });
    }
  } catch (error) {
    console.error("Profile completion error:", error);
    return Response.json(
      {
        error: "Internal server error",
      },
      { status: 500 },
    );
  }
}

export async function GET() {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // Get user profile from ServiceHub users table
    const userProfile = await sql`
      SELECT * FROM users WHERE id = ${userId} LIMIT 1
    `;

    if (userProfile.length === 0) {
      return Response.json({
        user: null,
        auth_user: session.user,
        needs_completion: true,
      });
    }

    return Response.json({
      user: userProfile[0],
      auth_user: session.user,
      needs_completion: false,
    });
  } catch (error) {
    console.error("Get profile error:", error);
    return Response.json(
      {
        error: "Internal server error",
      },
      { status: 500 },
    );
  }
}
