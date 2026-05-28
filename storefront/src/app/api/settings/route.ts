import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey123';

function isAuthenticated(token: string | undefined) {
  if (!token) return false;
  try {
    jwt.verify(token, JWT_SECRET);
    return true;
  } catch {
    return false;
  }
}

export async function GET() {
  try {
    let settings = await prisma.siteSettings.findUnique({ where: { id: 1 } });
    if (!settings) {
      // Create defaults if they don't exist
      settings = await prisma.siteSettings.create({
        data: {
          id: 1,
          heroImageUrl: null,
          featuredProducts: [],
          journalEntries: []
        }
      });
    }
    return NextResponse.json(settings);
  } catch (error) {
    console.error('Settings GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('admin_token')?.value;

    if (!isAuthenticated(token)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();

    const settings = await prisma.siteSettings.upsert({
      where: { id: 1 },
      update: {
        heroImageUrl: data.heroImageUrl !== undefined ? data.heroImageUrl : undefined,
        featuredProducts: data.featuredProducts !== undefined ? data.featuredProducts : undefined,
        journalEntries: data.journalEntries !== undefined ? data.journalEntries : undefined,
      },
      create: {
        id: 1,
        heroImageUrl: data.heroImageUrl,
        featuredProducts: data.featuredProducts || [],
        journalEntries: data.journalEntries || [],
      }
    });

    return NextResponse.json(settings);
  } catch (error) {
    console.error('Settings PUT error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
