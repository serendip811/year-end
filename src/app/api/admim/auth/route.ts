import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { password } = body;

        // Check admin password
        const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
        if (password !== adminPassword) {
            return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error in admin auth API:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

