import React from 'react';

const PrescriptionsList = ({ prescriptions }) => {
    if (prescriptions.length === 0) {
        return (
            <div className="text-center py-8 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                <p className="text-slate-400 text-sm">No prescriptions added.</p>
            </div>
        );
    }

    return (
        <ul className="divide-y">
            {prescriptions.map(presc => (
                <li key={presc.id} className="py-4">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="font-semibold text-gray-800">
                                {new Date(presc.prescription_date).toLocaleDateString()}
                            </p>
                            <p className="text-sm text-gray-600 mt-1">
                                <span className="font-medium text-slate-700">{presc.doctor_name}</span> 
                                <span className="mx-1 text-slate-400">•</span>
                                {presc.hospital_name}
                            </p>
                            {presc.symptoms && (
                                <p className="text-xs text-gray-500 mt-2 bg-slate-50 inline-block px-2 py-1 rounded">
                                    Symptoms: {presc.symptoms}
                                </p>
                            )}
                        </div>
                        {presc.file && (
                            <a 
                                href={presc.file} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-indigo-500 text-sm hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-3 py-1 rounded-full transition-all"
                            >
                                View
                            </a>
                        )}
                    </div>
                </li>
            ))}
        </ul>
    );
};

export default PrescriptionsList;
