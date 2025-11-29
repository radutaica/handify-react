import sql from "../../utils/sql.js";

// GET /api/users/[id] - Get a specific user by ID
export async function GET(request, { params }) {
  try {
    const { id } = params;

    if (!id) {
      return Response.json({ error: "User ID is required" }, { status: 400 });
    }

    const users = await sql`
      SELECT 
        id, email, first_name, last_name, phone, profile_image_url,
        user_type, location_address, location_city, location_state, 
        location_zip, verified, active, created_at
      FROM users 
      WHERE id = ${id} AND active = true
    `;

    if (users.length === 0) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    return Response.json(users[0]);
  } catch (error) {
    console.error("Error fetching user:", error);
    return Response.json({ error: "Failed to fetch user" }, { status: 500 });
  }
}

// PUT /api/users/[id] - Update a user
export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const updateData = await request.json();

    if (!id) {
      return Response.json({ error: "User ID is required" }, { status: 400 });
    }

    // Build dynamic update query
    const setClause = [];
    const values = [];
    let paramCount = 0;

    const allowedFields = [
      "first_name",
      "last_name",
      "phone",
      "profile_image_url",
      "location_address",
      "location_city",
      "location_state",
      "location_zip",
    ];

    for (const [key, value] of Object.entries(updateData)) {
      if (allowedFields.includes(key) && value !== undefined) {
        paramCount++;
        setClause.push(`${key} = $${paramCount}`);
        values.push(value);
      }
    }

    if (setClause.length === 0) {
      return Response.json(
        { error: "No valid fields to update" },
        { status: 400 },
      );
    }

    // Add location coordinates if provided
    if (updateData.location_coordinates) {
      paramCount++;
      setClause.push(`location_coordinates = $${paramCount}`);
      values.push(
        `POINT(${updateData.location_coordinates.lng} ${updateData.location_coordinates.lat})`,
      );
    }

    paramCount++;
    const query = `
      UPDATE users 
      SET ${setClause.join(", ")}, updated_at = NOW()
      WHERE id = $${paramCount} AND active = true
      RETURNING id, email, first_name, last_name, phone, profile_image_url,
                user_type, location_address, location_city, location_state, 
                location_zip, verified, active, created_at, updated_at
    `;
    values.push(id);

    const result = await sql(query, values);

    if (result.length === 0) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    return Response.json(result[0]);
  } catch (error) {
    console.error("Error updating user:", error);
    return Response.json({ error: "Failed to update user" }, { status: 500 });
  }
}

// DELETE /api/users/[id] - Soft delete a user
export async function DELETE(request, { params }) {
  try {
    const { id } = params;

    if (!id) {
      return Response.json({ error: "User ID is required" }, { status: 400 });
    }

    const result = await sql`
      UPDATE users 
      SET active = false, updated_at = NOW()
      WHERE id = ${id} AND active = true
      RETURNING id
    `;

    if (result.length === 0) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    return Response.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    return Response.json({ error: "Failed to delete user" }, { status: 500 });
  }
}
