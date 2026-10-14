// ============================================================================
// API ROUTE HANDLERS - Next.js App Router Implementation Templates
// ============================================================================
// These files serve as implementation templates for the backend API.
// They document the expected request/response formats and business logic.
// ============================================================================

// ============================================================================
// src/app/api/auth/login/route.ts
// ============================================================================

/*
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Validation
    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        renterIndividual: true,
        renterCorporate: true,
        fleetOwner: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return NextResponse.json(
        { success: false, error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Check if user is verified
    if (user.status !== 'verified') {
      return NextResponse.json(
        { success: false, error: 'Account not verified. Please complete KYC.' },
        { status: 403 }
      );
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );

    // Return user data
    return NextResponse.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.renterIndividual?.fullName || 
              user.renterCorporate?.companyName || 
              user.fleetOwner?.businessName ||
              'Admin',
        role: user.role,
        avatar: user.avatar,
        phone: user.phone,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
*/

// ============================================================================
// src/app/api/auth/register/route.ts
// ============================================================================

/*
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, name, phone, role, ...extraFields } = body;

    // Validation
    if (!email || !password || !name || !phone || !role) {
      return NextResponse.json(
        { success: false, error: 'All required fields must be provided' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'Email already registered' },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        phone,
        role: role.toUpperCase(),
        status: 'PENDING',
      },
    });

    // Create role-specific profile
    if (role === 'individual') {
      await prisma.renterIndividual.create({
        data: {
          userId: user.id,
          fullName: name,
          ktpNumber: extraFields.ktpNumber,
          simNumber: extraFields.simNumber,
          address: extraFields.address || '',
          ktpScan: '',
          simScan: '',
          kkScan: '',
        },
      });
    } else if (role === 'corporate') {
      await prisma.renterCorporate.create({
        data: {
          userId: user.id,
          companyName: extraFields.companyName || name,
          nib: extraFields.nib,
          npwp: extraFields.npwp,
          picName: extraFields.picName || name,
          picKtp: '',
          picSim: '',
          nibDocument: '',
          akta: '',
          npwpDocument: '',
          picKtpScan: '',
          picSimScan: '',
        },
      });
    } else if (role === 'owner') {
      await prisma.fleetOwner.create({
        data: {
          userId: user.id,
          businessName: name,
          bankAccount: '',
          bankName: '',
        },
      });
    }

    // TODO: Send verification email

    return NextResponse.json({
      success: true,
      message: 'Registration successful. Please verify your email.',
      userId: user.id,
    });
  } catch (error) {
    console.error('Register error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
*/

// ============================================================================
// src/app/api/auth/me/route.ts
// ============================================================================

/*
import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const decoded = verifyToken(token);

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        phone: true,
        role: true,
        status: true,
        avatar: true,
        createdAt: true,
        renterIndividual: {
          select: { fullName: true },
        },
        renterCorporate: {
          select: { companyName: true },
        },
        fleetOwner: {
          select: { businessName: true },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    const name = user.renterIndividual?.fullName || 
                 user.renterCorporate?.companyName || 
                 user.fleetOwner?.businessName ||
                 'Admin';

    return NextResponse.json({
      id: user.id,
      email: user.email,
      name,
      role: user.role.toLowerCase(),
      status: user.status.toLowerCase(),
      avatar: user.avatar,
      createdAt: user.createdAt,
    });
  } catch (error) {
    console.error('Get user error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
*/

// ============================================================================
// src/app/api/vehicles/route.ts
// ============================================================================

/*
import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/vehicles - List vehicles
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');
    const location = searchParams.get('location');

    const where: any = {};

    if (status) {
      where.status = status.toUpperCase();
    }

    if (location) {
      where.location = { contains: location, mode: 'insensitive' };
    }

    const [vehicles, total] = await Promise.all([
      prisma.vehicle.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        include: {
          owner: {
            include: {
              user: {
                select: {
                  id: true,
                  email: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.vehicle.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: vehicles,
      total,
      page,
      limit,
    });
  } catch (error) {
    console.error('List vehicles error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/vehicles - Create vehicle
export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const decoded = verifyToken(token);

    if (decoded.role !== 'OWNER') {
      return NextResponse.json(
        { success: false, error: 'Only owners can create vehicles' },
        { status: 403 }
      );
    }

    const body = await request.json();

    // Get owner profile
    const owner = await prisma.fleetOwner.findUnique({
      where: { userId: decoded.userId },
    });

    if (!owner) {
      return NextResponse.json(
        { success: false, error: 'Owner profile not found' },
        { status: 404 }
      );
    }

    // Create vehicle
    const vehicle = await prisma.vehicle.create({
      data: {
        ownerId: owner.id,
        brand: body.brand,
        model: body.model,
        year: body.year,
        transmission: body.transmission.toUpperCase(),
        capacity: body.capacity,
        fuelType: body.fuelType,
        features: body.features,
        priceDaily: body.priceDaily,
        priceWeekly: body.priceWeekly,
        priceMonthly: body.priceMonthly,
        hasDriverOption: body.hasDriverOption,
        driverPriceDaily: body.driverPriceDaily,
        status: 'AVAILABLE',
        location: body.location,
        images: body.images,
        model3D: body.model3D,
      },
    });

    return NextResponse.json({
      success: true,
      data: vehicle,
    });
  } catch (error) {
    console.error('Create vehicle error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
*/

// ============================================================================
// src/app/api/bookings/route.ts
// ============================================================================

/*
import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/bookings - List bookings
export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const decoded = verifyToken(token);
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');

    const where: any = {};

    // Filter by user role
    if (decoded.role === 'RENTER') {
      where.renterId = decoded.userId;
    } else if (decoded.role === 'OWNER') {
      const owner = await prisma.fleetOwner.findUnique({
        where: { userId: decoded.userId },
      });
      if (owner) {
        where.vehicle = { ownerId: owner.id };
      }
    }

    if (status) {
      where.status = status.toUpperCase();
    }

    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        include: {
          renter: {
            select: {
              id: true,
              email: true,
              phone: true,
              renterIndividual: { select: { fullName: true } },
              renterCorporate: { select: { companyName: true } },
            },
          },
          vehicle: true,
          payments: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.booking.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: bookings,
      total,
      page,
      limit,
    });
  } catch (error) {
    console.error('List bookings error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/bookings - Create booking
export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const decoded = verifyToken(token);
    const body = await request.json();

    // Validate vehicle exists and is available
    const vehicle = await prisma.vehicle.findUnique({
      where: { id: body.vehicleId },
      include: { owner: true },
    });

    if (!vehicle) {
      return NextResponse.json(
        { success: false, error: 'Vehicle not found' },
        { status: 404 }
      );
    }

    if (vehicle.status !== 'AVAILABLE') {
      return NextResponse.json(
        { success: false, error: 'Vehicle not available' },
        { status: 400 }
      );
    }

    // Calculate pricing
    const startDate = new Date(body.startDate);
    const endDate = new Date(body.endDate);
    const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

    let basePrice = 0;
    if (body.durationType === 'DAILY') {
      basePrice = days * vehicle.priceDaily;
    } else if (body.durationType === 'WEEKLY') {
      basePrice = Math.ceil(days / 7) * vehicle.priceWeekly;
    } else {
      basePrice = Math.ceil(days / 30) * vehicle.priceMonthly;
    }

    const driverCost = body.withDriver && vehicle.hasDriverOption 
      ? days * (vehicle.driverPriceDaily || 0)
      : 0;

    const totalPrice = basePrice + driverCost;
    const dpAmount = totalPrice * 0.5; // 50% DP

    // Create booking
    const booking = await prisma.booking.create({
      data: {
        renterId: decoded.userId,
        vehicleId: body.vehicleId,
        startDate,
        endDate,
        durationType: body.durationType.toUpperCase(),
        withDriver: body.withDriver,
        totalPrice,
        dpAmount,
        tripOrigin: body.tripOrigin,
        tripDestination: body.tripDestination,
        tripPurpose: body.tripPurpose,
        guaranteeType: body.guaranteeType.toUpperCase(),
        guaranteeDoc: body.guaranteeDoc,
        status: 'PENDING',
        contractSigned: false,
      },
      include: {
        renter: true,
        vehicle: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: booking,
    });
  } catch (error) {
    console.error('Create booking error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
*/

// ============================================================================
// src/app/api/bookings/[id]/approve/route.ts
// ============================================================================

/*
import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const decoded = verifyToken(token);

    if (decoded.role !== 'OWNER' && decoded.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Only owners or admins can approve bookings' },
        { status: 403 }
      );
    }

    const booking = await prisma.booking.findUnique({
      where: { id: params.id },
      include: {
        vehicle: {
          include: { owner: true },
        },
      },
    });

    if (!booking) {
      return NextResponse.json(
        { success: false, error: 'Booking not found' },
        { status: 404 }
      );
    }

    // Verify ownership
    if (decoded.role === 'OWNER' && booking.vehicle.owner.userId !== decoded.userId) {
      return NextResponse.json(
        { success: false, error: 'You can only approve bookings for your vehicles' },
        { status: 403 }
      );
    }

    if (booking.status !== 'PENDING') {
      return NextResponse.json(
        { success: false, error: 'Booking is not in pending status' },
        { status: 400 }
      );
    }

    // Update booking status
    const updatedBooking = await prisma.booking.update({
      where: { id: params.id },
      data: { status: 'CONFIRMED' },
      include: {
        renter: true,
        vehicle: true,
      },
    });

    // TODO: Send notification to renter

    return NextResponse.json({
      success: true,
      message: 'Booking approved successfully',
      booking: updatedBooking,
    });
  } catch (error) {
    console.error('Approve booking error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
*/

// ============================================================================
// src/app/api/payments/callback/route.ts
// ============================================================================

/*
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Verify Midtrans signature
    const { transaction_id, order_id, status_code, gross_amount, signature_key } = body;

    const expectedSignature = crypto
      .createHash('sha512')
      .update(`${order_id}${status_code}${gross_amount}${process.env.MIDTRANS_SERVER_KEY}`)
      .digest('hex');

    if (signature_key !== expectedSignature) {
      return NextResponse.json(
        { success: false, error: 'Invalid signature' },
        { status: 403 }
      );
    }

    // Find payment by order_id
    const payment = await prisma.payment.findFirst({
      where: { transactionId: transaction_id },
    });

    if (!payment) {
      return NextResponse.json(
        { success: false, error: 'Payment not found' },
        { status: 404 }
      );
    }

    // Update payment status
    let newStatus = 'PENDING';
    if (body.transaction_status === 'settlement' || body.transaction_status === 'capture') {
      newStatus = 'PAID';
    } else if (body.transaction_status === 'cancel' || body.transaction_status === 'deny' || body.transaction_status === 'expire') {
      newStatus = 'FAILED';
    } else if (body.transaction_status === 'refund') {
      newStatus = 'REFUNDED';
    }

    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: newStatus,
        paidAt: newStatus === 'PAID' ? new Date() : null,
      },
    });

    // If payment is for DP and status is PAID, update booking status
    if (payment.type === 'DP' && newStatus === 'PAID') {
      await prisma.booking.update({
        where: { id: payment.bookingId },
        data: { status: 'CONFIRMED' },
      });
    }

    // TODO: Send notification to user

    return NextResponse.json({
      success: true,
      message: 'Callback processed',
    });
  } catch (error) {
    console.error('Payment callback error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
*/

// ============================================================================
// src/app/api/users/[id]/verify/route.ts
// ============================================================================

/*
import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const decoded = verifyToken(token);

    if (decoded.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Only admins can verify users' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { status, reason, notes } = body;

    if (!status || !['VERIFIED', 'REJECTED'].includes(status)) {
      return NextResponse.json(
        { success: false, error: 'Invalid status. Must be VERIFIED or REJECTED' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: params.id },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Update user status
    const updatedUser = await prisma.user.update({
      where: { id: params.id },
      data: { status: status },
    });

    // TODO: Send email notification to user
    // TODO: Log verification action for audit trail

    return NextResponse.json({
      success: true,
      message: status === 'VERIFIED' 
        ? 'User verified successfully' 
        : `User rejected: ${reason || 'No reason provided'}`,
      user: updatedUser,
    });
  } catch (error) {
    console.error('Verify user error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
*/

// ============================================================================
// src/app/api/reports/revenue/route.ts
// ============================================================================

/*
import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const decoded = verifyToken(token);

    if (decoded.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Only admins can access reports' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const groupBy = searchParams.get('groupBy') || 'day';

    if (!startDate || !endDate) {
      return NextResponse.json(
        { success: false, error: 'startDate and endDate are required' },
        { status: 400 }
      );
    }

    // Get bookings in date range
    const bookings = await prisma.booking.findMany({
      where: {
        createdAt: {
          gte: new Date(startDate),
          lte: new Date(endDate),
        },
        status: {
          in: ['CONFIRMED', 'ACTIVE', 'COMPLETED'],
        },
      },
      select: {
        totalPrice: true,
        createdAt: true,
      },
    });

    // Calculate totals
    const totalRevenue = bookings.reduce((sum, b) => sum + b.totalPrice, 0);
    const totalBookings = bookings.length;
    const totalCommission = totalRevenue * 0.125; // 12.5% commission
    const averageBookingValue = totalBookings > 0 ? totalRevenue / totalBookings : 0;

    // Group by period
    const breakdown: { date: string; revenue: number; bookings: number }[] = [];
    const grouped = new Map<string, { revenue: number; bookings: number }>();

    bookings.forEach((booking) => {
      let key = '';
      const date = new Date(booking.createdAt);

      if (groupBy === 'day') {
        key = date.toISOString().split('T')[0];
      } else if (groupBy === 'week') {
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        key = weekStart.toISOString().split('T')[0];
      } else {
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      }

      if (!grouped.has(key)) {
        grouped.set(key, { revenue: 0, bookings: 0 });
      }

      const current = grouped.get(key)!;
      current.revenue += booking.totalPrice;
      current.bookings += 1;
    });

    grouped.forEach((value, key) => {
      breakdown.push({
        date: key,
        revenue: value.revenue,
        bookings: value.bookings,
      });
    });

    breakdown.sort((a, b) => a.date.localeCompare(b.date));

    // Calculate growth rate (compare with previous period)
    const growthRate = 18.5; // TODO: Calculate actual growth rate

    return NextResponse.json({
      period: `${startDate} to ${endDate}`,
      totalRevenue,
      totalBookings,
      totalCommission,
      averageBookingValue,
      growthRate,
      breakdown,
    });
  } catch (error) {
    console.error('Revenue report error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
*/

export {};
