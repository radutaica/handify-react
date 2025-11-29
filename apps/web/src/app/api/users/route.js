import sql from "../utils/sql.js";

// GET /api/users - Get all users (with optional filtering)
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userType = searchParams.get("user_type");
    const verified = searchParams.get("verified");
    const limit = parseInt(searchParams.get("limit")) || 50;
    const offset = parseInt(searchParams.get("offset")) || 0;

    let query = `
      SELECT 
        id, email, first_name, last_name, phone, profile_image_url,
        user_type, location_address, location_city, location_state, 
        location_zip, verified, active, created_at
      FROM users 
      WHERE active = true
    `;
    const params = [];
    let paramCount = 0;

    if (userType) {
      paramCount++;
      query += ` AND user_type = $${paramCount}`;
      params.push(userType);
    }

    if (verified !== null && verified !== undefined) {
      paramCount++;
      query += ` AND verified = $${paramCount}`;
      params.push(verified === "true");
    }

    paramCount++;
    query += ` ORDER BY created_at DESC LIMIT $${paramCount}`;
    params.push(limit);

    paramCount++;
    query += ` OFFSET $${paramCount}`;
    params.push(offset);

    const users = await sql(query, params);

    // Get total count
    let countQuery = `SELECT COUNT(*) as total FROM users WHERE active = true`;
    const countParams = [];
    let countParamCount = 0;

    if (userType) {
      countParamCount++;
      countQuery += ` AND user_type = $${countParamCount}`;
      countParams.push(userType);
    }

    if (verified !== null && verified !== undefined) {
      countParamCount++;
      countQuery += ` AND verified = $${countParamCount}`;
      countParams.push(verified === "true");
    }

    const countResult = await sql(countQuery, countParams);
    const total = parseInt(countResult[0].total);

    return Response.json({
      users,
      pagination: {
        limit,
        offset,
        total,
        hasMore: offset + limit < total,
      },
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    return Response.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}

// POST /api/users - Create a new user
export async function POST(request) {
  try {
    const {
      email,
      password_hash,
      first_name,
      last_name,
      phone,
      profile_image_url,
      user_type,
      location_address,
      location_city,
      location_state,
      location_zip,
      location_coordinates,
    } = await request.json();

    if (!email || !first_name || !last_name || !user_type) {
      return Response.json(
        { error: "Email, first name, last name, and user type are required" },
        { status: 400 },
      );
    }

    if (!["customer", "provider", "both"].includes(user_type)) {
      return Response.json(
        { error: "User type must be customer, provider, or both" },
        { status: 400 },
      );
    }

    const result = await sql`
      INSERT INTO users (
        email, password_hash, first_name, last_name, phone, profile_image_url,
        user_type, location_address, location_city, location_state, location_zip,
        location_coordinates
      ) VALUES (
        ${email}, ${password_hash || null}, ${first_name}, ${last_name}, 
        ${phone || null}, ${profile_image_url || null}, ${user_type},
        ${location_address || null}, ${location_city || null}, 
        ${location_state || null}, ${location_zip || null},
        ${location_coordinates ? `POINT(${location_coordinates.lng} ${location_coordinates.lat})` : null}
      )
      RETURNING id, email, first_name, last_name, phone, profile_image_url,
                user_type, location_address, location_city, location_state, 
                location_zip, verified, active, created_at
    `;

    return Response.json(result[0], { status: 201 });
  } catch (error) {
    console.error("Error creating user:", error);
    if (error.constraint === "users_email_key") {
      return Response.json({ error: "Email already exists" }, { status: 409 });
    }
    return Response.json({ error: "Failed to create user" }, { status: 500 });
  }
}
