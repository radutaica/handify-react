import sql from "../utils/sql.js";

// GET /api/services - Get all services with optional filtering
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get("category_id");
    const categoryName = searchParams.get("category");
    const active = searchParams.get("active") !== "false"; // default to true
    const limit = parseInt(searchParams.get("limit")) || 50;
    const offset = parseInt(searchParams.get("offset")) || 0;

    let query = `
      SELECT 
        s.id, s.name, s.description, s.base_price_min, s.base_price_max,
        s.price_unit, s.estimated_duration_min, s.estimated_duration_max,
        s.active, s.created_at,
        sc.id as category_id, sc.name as category_name, sc.icon_name, sc.color
      FROM services s
      LEFT JOIN service_categories sc ON s.category_id = sc.id
      WHERE s.active = $1
    `;
    const params = [active];
    let paramCount = 1;

    if (categoryId) {
      paramCount++;
      query += ` AND s.category_id = $${paramCount}`;
      params.push(categoryId);
    }

    if (categoryName) {
      paramCount++;
      query += ` AND sc.name ILIKE $${paramCount}`;
      params.push(`%${categoryName}%`);
    }

    paramCount++;
    query += ` ORDER BY sc.sort_order ASC, s.name ASC LIMIT $${paramCount}`;
    params.push(limit);

    paramCount++;
    query += ` OFFSET $${paramCount}`;
    params.push(offset);

    const services = await sql(query, params);

    // Get total count
    let countQuery = `
      SELECT COUNT(*) as total 
      FROM services s
      LEFT JOIN service_categories sc ON s.category_id = sc.id
      WHERE s.active = $1
    `;
    const countParams = [active];
    let countParamCount = 1;

    if (categoryId) {
      countParamCount++;
      countQuery += ` AND s.category_id = $${countParamCount}`;
      countParams.push(categoryId);
    }

    if (categoryName) {
      countParamCount++;
      countQuery += ` AND sc.name ILIKE $${countParamCount}`;
      countParams.push(`%${categoryName}%`);
    }

    const countResult = await sql(countQuery, countParams);
    const total = parseInt(countResult[0].total);

    return Response.json({
      services: services.map((service) => ({
        id: service.id,
        name: service.name,
        description: service.description,
        basePriceMin: parseFloat(service.base_price_min) || 0,
        basePriceMax: parseFloat(service.base_price_max) || 0,
        priceUnit: service.price_unit,
        estimatedDurationMin: service.estimated_duration_min,
        estimatedDurationMax: service.estimated_duration_max,
        active: service.active,
        createdAt: service.created_at,
        category: {
          id: service.category_id,
          name: service.category_name,
          iconName: service.icon_name,
          color: service.color,
        },
      })),
      pagination: {
        limit,
        offset,
        total,
        hasMore: offset + limit < total,
      },
    });
  } catch (error) {
    console.error("Error fetching services:", error);
    return Response.json(
      { error: "Failed to fetch services" },
      { status: 500 },
    );
  }
}

// POST /api/services - Create a new service
export async function POST(request) {
  try {
    const {
      category_id,
      name,
      description,
      base_price_min,
      base_price_max,
      price_unit,
      estimated_duration_min,
      estimated_duration_max,
    } = await request.json();

    if (!category_id || !name) {
      return Response.json(
        { error: "Category ID and name are required" },
        { status: 400 },
      );
    }

    const result = await sql`
      INSERT INTO services (
        category_id, name, description, base_price_min, base_price_max,
        price_unit, estimated_duration_min, estimated_duration_max
      ) VALUES (
        ${category_id}, ${name}, ${description || null}, 
        ${base_price_min || null}, ${base_price_max || null},
        ${price_unit || "hour"}, ${estimated_duration_min || null}, 
        ${estimated_duration_max || null}
      )
      RETURNING *
    `;

    return Response.json(
      {
        id: result[0].id,
        categoryId: result[0].category_id,
        name: result[0].name,
        description: result[0].description,
        basePriceMin: parseFloat(result[0].base_price_min) || 0,
        basePriceMax: parseFloat(result[0].base_price_max) || 0,
        priceUnit: result[0].price_unit,
        estimatedDurationMin: result[0].estimated_duration_min,
        estimatedDurationMax: result[0].estimated_duration_max,
        active: result[0].active,
        createdAt: result[0].created_at,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error creating service:", error);
    return Response.json(
      { error: "Failed to create service" },
      { status: 500 },
    );
  }
}
