import sql from "../utils/sql.js";

// GET /api/categories - Get all service categories
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const active = searchParams.get("active") !== "false"; // default to true
    const withServices = searchParams.get("with_services") === "true";

    const categories = await sql`
      SELECT id, name, description, icon_name, color, active, sort_order, created_at
      FROM service_categories 
      WHERE active = ${active}
      ORDER BY sort_order ASC, name ASC
    `;

    let result = categories.map((category) => ({
      id: category.id,
      name: category.name,
      description: category.description,
      iconName: category.icon_name,
      color: category.color,
      active: category.active,
      sortOrder: category.sort_order,
      createdAt: category.created_at,
    }));

    // Include services if requested
    if (withServices) {
      const services = await sql`
        SELECT 
          s.id, s.name, s.description, s.base_price_min, s.base_price_max,
          s.price_unit, s.estimated_duration_min, s.estimated_duration_max,
          s.category_id, s.active, s.created_at
        FROM services s
        WHERE s.active = true AND s.category_id = ANY(${result.map((c) => c.id)})
        ORDER BY s.name ASC
      `;

      // Group services by category
      const servicesByCategory = {};
      services.forEach((service) => {
        if (!servicesByCategory[service.category_id]) {
          servicesByCategory[service.category_id] = [];
        }
        servicesByCategory[service.category_id].push({
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
        });
      });

      result = result.map((category) => ({
        ...category,
        services: servicesByCategory[category.id] || [],
      }));
    }

    return Response.json(result);
  } catch (error) {
    console.error("Error fetching service categories:", error);
    return Response.json(
      { error: "Failed to fetch service categories" },
      { status: 500 },
    );
  }
}

// POST /api/categories - Create a new service category
export async function POST(request) {
  try {
    const { name, description, icon_name, color, sort_order } =
      await request.json();

    if (!name) {
      return Response.json({ error: "Name is required" }, { status: 400 });
    }

    const result = await sql`
      INSERT INTO service_categories (
        name, description, icon_name, color, sort_order
      ) VALUES (
        ${name}, ${description || null}, ${icon_name || null}, 
        ${color || null}, ${sort_order || 0}
      )
      RETURNING *
    `;

    return Response.json(
      {
        id: result[0].id,
        name: result[0].name,
        description: result[0].description,
        iconName: result[0].icon_name,
        color: result[0].color,
        active: result[0].active,
        sortOrder: result[0].sort_order,
        createdAt: result[0].created_at,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error creating service category:", error);
    if (error.constraint === "service_categories_name_key") {
      return Response.json(
        { error: "Category name already exists" },
        { status: 409 },
      );
    }
    return Response.json(
      { error: "Failed to create service category" },
      { status: 500 },
    );
  }
}
