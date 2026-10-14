import { supabase } from '../utils/supabaseClient';
import { generateRSAKeyPair } from '../encryption/generateKeys';

export async function signUp(email, password) {
    const role = 'user';
    let authDataResult;
    let user;

    const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: { role: role }
        }
    });

    if (authError) {
        // If user already exists in auth.users, try to sign in to get the user object
        if (authError.message.toLowerCase().includes("already registered") || authError.status === 422 || authError.status === 429) {
            const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
                email,
                password,
            });
            if (signInError) throw authError; // Throw original auth error if sign in also fails
            authDataResult = signInData;
            user = signInData.user;
        } else {
            throw authError;
        }
    } else {
        authDataResult = authData;
        user = authData.user;
    }

    if (!user) throw new Error("Could not retrieve user information.");

    // Check if user already exists in the 'users' table and if they have a public key
    const { data: existingUser } = await supabase
        .from('users')
        .select('id, public_key, role')
        .eq('id', user.id)
        .single();

    // Ensure metadata role is synced with the DB role (important for RLS)
    const currentMetadataRole = user.user_metadata?.role;
    const dbRole = existingUser?.role || role;

    if (currentMetadataRole !== dbRole) {
        await supabase.auth.updateUser({
            data: { role: dbRole }
        });
    }

    // If the user profile doesn't exist OR it's missing the public key, generate new keys
    if (!existingUser || !existingUser.public_key) {
        const { publicKeyJWK, privateKeyJWK } = await generateRSAKeyPair();

        // Store Private Key securely in browser (LocalStorage for this prototype)
        localStorage.setItem(`rsa_private_key_${user.id}`, JSON.stringify(privateKeyJWK));

        // Use upsert to create or update the profile with the new public key and role
        const { error: dbError } = await supabase
            .from('users')
            .upsert({
                id: user.id,
                email: user.email,
                role: dbRole,
                public_key: JSON.stringify(publicKeyJWK),
            }, { onConflict: 'id' });

        if (dbError) throw dbError;
    }

    return authDataResult;
}

export async function signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });
    if (error) throw error;

    // After sign in, ensure the metadata role is present
    const user = data.user;
    if (!user.user_metadata?.role) {
        const { data: userData } = await supabase
            .from('users')
            .select('role')
            .eq('id', user.id)
            .single();

        if (userData?.role) {
            await supabase.auth.updateUser({
                data: { role: userData.role }
            });
        }
    }

    return data;
}

export async function signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
}
