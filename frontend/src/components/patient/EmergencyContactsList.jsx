import React from 'react';

const EmergencyContactsList = ({ emergencyContacts }) => {
    if (emergencyContacts.length === 0) {
        return (
            <div className="text-center py-8 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                <p className="text-slate-400 text-sm">No emergency contacts added.</p>
            </div>
        );
    }

    return (
        <ul className="divide-y">
            {emergencyContacts.map(contact => (
                <li key={contact.id} className="py-4 flex justify-between items-center">
                    <div>
                        <p className="font-semibold text-gray-800">{contact.name}</p>
                        <p className="text-sm text-gray-600 mt-1">{contact.relationship} - {contact.phone}</p>
                    </div>
                    {contact.can_grant_access && (
                        <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full font-bold border border-orange-200">
                            Can Grant Access
                        </span>
                    )}
                </li>
            ))}
        </ul>
    );
};

export default EmergencyContactsList;
