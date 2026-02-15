import React from 'react';

const AccessHistoryList = ({ accessHistory }) => {
    if (accessHistory.length === 0) {
        return (
            <div className="text-center py-8 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                <p className="text-slate-400 text-sm">No access history.</p>
            </div>
        );
    }

    return (
        <ul className="divide-y max-h-96 overflow-y-auto custom-scrollbar">
            {accessHistory.map((log, idx) => (
                <li key={idx} className="py-3 hover:bg-slate-50 transition-colors px-2 rounded">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="font-semibold text-sm text-slate-800">{log.actor}</p>
                            <p className="text-xs text-slate-500 mt-0.5">
                                <span className={`font-mono uppercase text-[10px] px-1.5 py-0.5 rounded ${
                                    log.action.includes('VIEW') ? 'bg-blue-100 text-blue-700' :
                                    log.action.includes('ADD') ? 'bg-green-100 text-green-700' :
                                    'bg-gray-100 text-gray-700'
                                }`}>{log.action}</span>
                                <span className="mx-1">-</span>
                                {log.details}
                            </p>
                        </div>
                        <p className="text-xs text-slate-400 whitespace-nowrap ml-4">
                            {new Date(log.timestamp).toLocaleString()}
                        </p>
                    </div>
                </li>
            ))}
        </ul>
    );
};

export default AccessHistoryList;
