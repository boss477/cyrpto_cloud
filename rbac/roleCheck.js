import { supabase } from '../utils/supabaseClient';

export async function checkRole(allowedRoles) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    // Try metadata first (faster, avoids RLS recursion issues)
    const roleFromMetadata = user.user_metadata?.role;
    if (roleFromMetadata && allowedRoles.includes(roleFromMetadata)) return true;

    // Fallback to DB
    const { data: userData, error } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single();

    if (error || !userData) return false;

    return allowedRoles.includes(userData.role);
}

export const PERMISSIONS = {
    UPLOAD: ['admin', 'user'],
    DOWNLOAD: ['admin', 'user', 'viewer'],
    DELETE: ['admin', 'user'],
};
