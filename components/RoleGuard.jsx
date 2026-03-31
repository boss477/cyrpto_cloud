import { useEffect, useState } from 'react';
import { checkRole } from '../rbac/roleCheck';

export default function RoleGuard({ allowedRoles, children }) {
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function verify() {
            const authorized = await checkRole(allowedRoles);
            setIsAuthorized(authorized);
            setLoading(false);
        }
        verify();
    }, [allowedRoles]);

    if (loading) return <div>Checking permissions...</div>;
    if (!isAuthorized) return null;

    return <>{children}</>;
}
