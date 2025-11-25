import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { comparePassword, hashPassword } from '@/lib/auth';
import { getUserFromCookie } from '@/lib/jwt';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
    try {
        const userPayload = await getUserFromCookie();
        if (!userPayload) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { currentPassword, newPassword } = await request.json();

        if (!currentPassword || !newPassword) {
            return NextResponse.json({ error: 'Current and new passwords are required' }, { status: 400 });
        }

        // Get user from DB to get current hash
        const { data: user, error } = await supabaseAdmin
            .from('users')
            .select('*')
            .eq('id', userPayload.id)
            .single();

        if (error || !user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Verify current password
        const isValid = await comparePassword(currentPassword, user.password_hash);
        if (!isValid) {
            return NextResponse.json({ error: 'Incorrect current password' }, { status: 400 });
        }

        // Hash new password
        const newHash = await hashPassword(newPassword);

        // Update DB
        const { error: updateError } = await supabaseAdmin
            .from('users')
            .update({ password_hash: newHash })
            .eq('id', user.id);

        if (updateError) {
            return NextResponse.json({ error: 'Failed to update password' }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Change password error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
