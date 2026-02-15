import React from 'react';

const SharingPermissionsList = ({ sharingPermissions, handleRevokeAccess }) => {
    const activePermissions = sharingPermissions.filter(p => p.is_active);

    if (activePermissions.length === 0) {
        return (
            <div className="text-center py-8 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                <p className="text-slate-400 text-sm">No active permissions.</p>
            </div>
        );
    }

    return (
        <ul className="divide-y">
            {activePermissions.map(perm => (
                <li key={perm.id} className="py-4 flex justify-between items-center group">
                    <div>
                        <p className="font-semibold text-gray-800">{perm.doctor_name}</p>
                        <p className="text-xs text-gray-500 mt-1">
                            {perm.access_type}
                            <span className="mx-2 text-slate-300">|</span>
                            Granted: {new Date(perm.granted_at).toLocaleDateString()}
                            {perm.expires_at && ` (Expires: ${new Date(perm.expires_at).toLocaleDateString()})`}
                        </p>
                        <div className="flex gap-2 mt-2">
                            {perm.can_view_records && <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded font-medium">View Records</span>}
                            {perm.can_view_documents && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded font-medium">View Documents</span>}
                            {perm.can_add_records && <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded font-medium">Add Records</span>}
                        </div>
                    </div>
                    <button
                        onClick={() => handleRevokeAccess(perm.id)}
                        className="text-red-500 hover:text-red-700 text-sm font-medium border border-red-200 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-all"
                    >
                        Revoke Access
                    </button>
                </li>
            ))}
        </ul>
    );
};

export default SharingPermissionsList;
