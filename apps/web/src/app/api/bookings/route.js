import sql from "../utils/sql.js";

// GET /api/bookings - Get bookings with optional filtering
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get("customer_id");
    const providerId = searchParams.get("provider_id");
    const status = searchParams.get("status");
    const limit = parseInt(searchParams.get("limit")) || 50;
    const offset = parseInt(searchParams.get("offset")) || 0;

    let query = `
      SELECT 
        b.id, b.customer_id, b.provider_id, b.service_id, b.status,
        b.title, b.description, b.location_address, b.location_city,
        b.location_state, b.location_zip, b.scheduled_date, 
        b.scheduled_time_start, b.scheduled_time_end, b.estimated_duration,
        b.budget_min, b.budget_max, b.final_price, b.urgency,
        b.customer_notes, b.provider_notes, b.cancellation_reason,
        b.cancelled_by, b.created_at, b.updated_at, b.completed_at, b.cancelled_at,
        -- Customer info
        u_customer.first_name as customer_first_name,
        u_customer.last_name as customer_last_name,
        u_customer.email as customer_email,
        u_customer.phone as customer_phone,
        u_customer.profile_image_url as customer_image,
        -- Provider info
        pp.id as provider_profile_id,
        pp.business_name,
        u_provider.first_name as provider_first_name,
        u_provider.last_name as provider_last_name,
        u_provider.email as provider_email,
        u_provider.phone as provider_phone,
        u_provider.profile_image_url as provider_image,
        -- Service info
        s.name as service_name,
        sc.name as category_name,
        sc.icon_name as category_icon,
        sc.color as category_color
      FROM bookings b
      LEFT JOIN users u_customer ON b.customer_id = u_customer.id
      LEFT JOIN provider_profiles pp ON b.provider_id = pp.id
      LEFT JOIN users u_provider ON pp.user_id = u_provider.id
      LEFT JOIN services s ON b.service_id = s.id
      LEFT JOIN service_categories sc ON s.category_id = sc.id
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 0;

    if (customerId) {
      paramCount++;
      query += ` AND b.customer_id = $${paramCount}`;
      params.push(customerId);
    }

    if (providerId) {
      paramCount++;
      query += ` AND b.provider_id = $${paramCount}`;
      params.push(providerId);
    }

    if (status) {
      paramCount++;
      query += ` AND b.status = $${paramCount}`;
      params.push(status);
    }

    paramCount++;
    query += ` ORDER BY b.created_at DESC LIMIT $${paramCount}`;
    params.push(limit);

    paramCount++;
    query += ` OFFSET $${paramCount}`;
    params.push(offset);

    const bookings = await sql(query, params);

    // Get total count
    let countQuery = `SELECT COUNT(*) as total FROM bookings b WHERE 1=1`;
    const countParams = [];
    let countParamCount = 0;

    if (customerId) {
      countParamCount++;
      countQuery += ` AND b.customer_id = $${countParamCount}`;
      countParams.push(customerId);
    }

    if (providerId) {
      countParamCount++;
      countQuery += ` AND b.provider_id = $${countParamCount}`;
      countParams.push(providerId);
    }

    if (status) {
      countParamCount++;
      countQuery += ` AND b.status = $${countParamCount}`;
      countParams.push(status);
    }

    const countResult = await sql(countQuery, countParams);
    const total = parseInt(countResult[0].total);

    return Response.json({
      bookings: bookings.map((booking) => ({
        id: booking.id,
        customerId: booking.customer_id,
        providerId: booking.provider_id,
        serviceId: booking.service_id,
        status: booking.status,
        title: booking.title,
        description: booking.description,
        location: {
          address: booking.location_address,
          city: booking.location_city,
          state: booking.location_state,
          zip: booking.location_zip,
        },
        scheduledDate: booking.scheduled_date,
        scheduledTimeStart: booking.scheduled_time_start,
        scheduledTimeEnd: booking.scheduled_time_end,
        estimatedDuration: booking.estimated_duration,
        budgetMin: parseFloat(booking.budget_min) || 0,
        budgetMax: parseFloat(booking.budget_max) || 0,
        finalPrice: parseFloat(booking.final_price) || 0,
        urgency: booking.urgency,
        customerNotes: booking.customer_notes,
        providerNotes: booking.provider_notes,
        cancellationReason: booking.cancellation_reason,
        cancelledBy: booking.cancelled_by,
        createdAt: booking.created_at,
        updatedAt: booking.updated_at,
        completedAt: booking.completed_at,
        cancelledAt: booking.cancelled_at,
        customer: {
          id: booking.customer_id,
          firstName: booking.customer_first_name,
          lastName: booking.customer_last_name,
          email: booking.customer_email,
          phone: booking.customer_phone,
          profileImage: booking.customer_image,
        },
        provider: booking.provider_profile_id
          ? {
              id: booking.provider_profile_id,
              businessName: booking.business_name,
              firstName: booking.provider_first_name,
              lastName: booking.provider_last_name,
              email: booking.provider_email,
              phone: booking.provider_phone,
              profileImage: booking.provider_image,
            }
          : null,
        service: {
          id: booking.service_id,
          name: booking.service_name,
          category: {
            name: booking.category_name,
            iconName: booking.category_icon,
            color: booking.category_color,
          },
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
    console.error("Error fetching bookings:", error);
    return Response.json(
      { error: "Failed to fetch bookings" },
      { status: 500 },
    );
  }
}

// POST /api/bookings - Create a new booking
export async function POST(request) {
  try {
    const {
      customer_id,
      service_id,
      title,
      description,
      location_address,
      location_city,
      location_state,
      location_zip,
      location_coordinates,
      scheduled_date,
      scheduled_time_start,
      scheduled_time_end,
      estimated_duration,
      budget_min,
      budget_max,
      urgency,
      customer_notes,
    } = await request.json();

    if (!customer_id || !service_id || !title || !location_address) {
      return Response.json(
        {
          error:
            "Customer ID, service ID, title, and location address are required",
        },
        { status: 400 },
      );
    }

    const validStatuses = ["low", "normal", "high", "urgent"];
    if (urgency && !validStatuses.includes(urgency)) {
      return Response.json({ error: "Invalid urgency level" }, { status: 400 });
    }

    const result = await sql`
      INSERT INTO bookings (
        customer_id, service_id, title, description, location_address,
        location_city, location_state, location_zip, location_coordinates,
        scheduled_date, scheduled_time_start, scheduled_time_end,
        estimated_duration, budget_min, budget_max, urgency, customer_notes
      ) VALUES (
        ${customer_id}, ${service_id}, ${title}, ${description || null},
        ${location_address}, ${location_city || null}, ${location_state || null}, 
        ${location_zip || null},
        ${location_coordinates ? `POINT(${location_coordinates.lng} ${location_coordinates.lat})` : null},
        ${scheduled_date || null}, ${scheduled_time_start || null}, 
        ${scheduled_time_end || null}, ${estimated_duration || null},
        ${budget_min || null}, ${budget_max || null}, ${urgency || "normal"}, 
        ${customer_notes || null}
      )
      RETURNING *
    `;

    return Response.json(
      {
        id: result[0].id,
        customerId: result[0].customer_id,
        serviceId: result[0].service_id,
        status: result[0].status,
        title: result[0].title,
        description: result[0].description,
        location: {
          address: result[0].location_address,
          city: result[0].location_city,
          state: result[0].location_state,
          zip: result[0].location_zip,
        },
        scheduledDate: result[0].scheduled_date,
        scheduledTimeStart: result[0].scheduled_time_start,
        scheduledTimeEnd: result[0].scheduled_time_end,
        estimatedDuration: result[0].estimated_duration,
        budgetMin: parseFloat(result[0].budget_min) || 0,
        budgetMax: parseFloat(result[0].budget_max) || 0,
        urgency: result[0].urgency,
        customerNotes: result[0].customer_notes,
        createdAt: result[0].created_at,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error creating booking:", error);
    return Response.json(
      { error: "Failed to create booking" },
      { status: 500 },
    );
  }
}
