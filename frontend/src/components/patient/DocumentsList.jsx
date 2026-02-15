import React from 'react';

const DocumentsList = ({ documents }) => {
    if (documents.length === 0) {
        return (
            <div className="text-center py-8 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                <p className="text-slate-400 text-sm">No documents uploaded.</p>
            </div>
        );
    }

    return (
        <ul className="divide-y">
            {documents.map(doc => (
                <li key={doc.id} className="py-4 flex justify-between items-center group">
                    <div>
                        <p className="font-semibold text-gray-800 group-hover:text-indigo-600 transition-colors">{doc.title}</p>
                        <p className="text-xs text-slate-500">
                            <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-600 font-medium mr-2">
                                {doc.document_type}
                            </span> 
                            {new Date(doc.uploaded_at).toLocaleDateString()}
                        </p>
                        {doc.description && (
                            <p className="text-xs text-gray-400 mt-1 truncate max-w-xs">{doc.description}</p>
                        )}
                    </div>
                    {doc.file && (
                        <a 
                            href={doc.file} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-indigo-500 text-sm hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-3 py-1 rounded-full transition-all"
                        >
                            View
                        </a>
                    )}
                </li>
            ))}
        </ul>
    );
};

export default DocumentsList;
