import React from 'react';

const AddEmergencyContactForm = ({ newContact, setNewContact, handleAddContact }) => {
    return (
        <div className="bg-gray-50 p-4 rounded">
            <h3 className="font-bold mb-3">Add Emergency Contact</h3>
            <form onSubmit={handleAddContact} className="space-y-3">
                <input
                    type="text"
                    placeholder="Name *"
                    required
                    className="w-full border p-2 rounded focus:ring-2 focus:ring-orange-500 focus:outline-none"
                    value={newContact.name}
                    onChange={e => setNewContact({ ...newContact, name: e.target.value })}
                />
                <input
                    type="text"
                    placeholder="Relationship *"
                    required
                    className="w-full border p-2 rounded focus:ring-2 focus:ring-orange-500 focus:outline-none"
                    value={newContact.relationship}
                    onChange={e => setNewContact({ ...newContact, relationship: e.target.value })}
                />
                <input
                    type="tel"
                    placeholder="Phone *"
                    required
                    className="w-full border p-2 rounded focus:ring-2 focus:ring-orange-500 focus:outline-none"
                    value={newContact.phone}
                    onChange={e => setNewContact({ ...newContact, phone: e.target.value })}
                />
                <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                    <input
                        type="checkbox"
                        className="rounded text-orange-500 focus:ring-orange-500"
                        checked={newContact.can_grant_access}
                        onChange={e => setNewContact({ ...newContact, can_grant_access: e.target.checked })}
                    />
                    Can grant access on my behalf (emergencies)
                </label>
                <button type="submit" className="w-full bg-orange-500 text-white py-2 rounded hover:bg-orange-600 transition-colors shadow-sm font-semibold">
                    Add Contact
                </button>
            </form>
        </div>
    );
};

export default AddEmergencyContactForm;
