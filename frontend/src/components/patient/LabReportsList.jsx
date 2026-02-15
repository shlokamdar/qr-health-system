import React from 'react';

const LabReportsList = ({ labReports }) => {
    if (labReports.length === 0) {
        return (
            <div className="text-center py-8 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                <p className="text-slate-400 text-sm">No lab reports found.</p>
            </div>
        );
    }

    return (
        <ul className="divide-y">
            {labReports.map(report => (
                <li key={report.id} className="py-4 flex justify-between items-center group">
                    <div>
                        <p className="font-semibold text-gray-800">{report.test_type_data?.name}</p>
                        <p className="text-xs text-gray-500 mt-1">
                            <span className="font-medium text-slate-700">{report.hospital_name}</span> 
                            <span className="mx-1">•</span> 
                            Tech: {report.technician_name}
                        </p>
                        <p className="text-sm mt-2 text-gray-700 bg-slate-50 p-2 rounded-lg inline-block border border-slate-100">
                            {report.comments}
                        </p>
                    </div>
                    {report.file && (
                        <a 
                            href={report.file} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-indigo-500 text-sm font-medium hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-3 py-1 rounded-full transition-all"
                        >
                            View Report
                        </a>
                    )}
                </li>
            ))}
        </ul>
    );
};

export default LabReportsList;
