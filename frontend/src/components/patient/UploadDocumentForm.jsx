import React from 'react';

const SELECT_CHEVRON =
  'url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%2364748b\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3e%3cpolyline points=\'6 9 12 15 18 9\'%3e%3c/polyline%3e%3c/svg%3e")';

const fieldClass =
  'w-full min-h-[44px] border border-[#dee2e6] rounded-md bg-white px-3.5 py-2.5 text-sm text-[#0D1B2A] placeholder:text-slate-400/90 ' +
  'transition-colors box-border hover:border-slate-300 focus:outline-none focus:border-[#3B9EE2] focus:ring-[3px] focus:ring-[#3B9EE2]/18';

const labelClass = 'block text-[12px] font-normal text-[#718096] mb-1.5';

const UploadDocumentForm = ({ newDocument, setNewDocument, handleUpload }) => (
  <div className="bg-white rounded-[10px] border border-[#E2E8F0] p-6 sm:p-8 shadow-[0_1px_3px_rgba(15,23,42,0.06)] max-w-full">
    <h3 className="text-[#0D1B2A] text-lg font-bold tracking-tight mb-6">Upload Document</h3>
    <form onSubmit={handleUpload} className="flex flex-col gap-5">
      <div>
        <label className={labelClass}>Document Type</label>
        <select
          value={newDocument.document_type}
          onChange={e => setNewDocument({ ...newDocument, document_type: e.target.value })}
          className={fieldClass}
          style={{
            appearance: 'none',
            backgroundImage: SELECT_CHEVRON,
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'right 12px center',
            backgroundSize: '1.1em',
          }}
        >
          <option value="REPORT">Report</option>
          <option value="INSURANCE">Insurance</option>
          <option value="VACCINATION">Vaccination</option>
          <option value="OTHER">Other</option>
        </select>
      </div>
      <div>
        <label className={labelClass}>Title *</label>
        <input
          type="text"
          placeholder="Document title"
          required
          value={newDocument.title}
          onChange={e => setNewDocument({ ...newDocument, title: e.target.value })}
          className={fieldClass}
        />
      </div>
      <div>
        <label className={labelClass}>Description</label>
        <textarea
          placeholder="Optional description"
          rows={4}
          value={newDocument.description}
          onChange={e => setNewDocument({ ...newDocument, description: e.target.value })}
          className={`${fieldClass} min-h-[100px] resize-y py-3 leading-relaxed`}
        />
      </div>
      <div>
        <label className={labelClass}>File</label>
        <input
          type="file"
          onChange={e => setNewDocument({ ...newDocument, file: e.target.files[0] })}
          className={`${fieldClass} py-2 text-sm file:mr-3 file:rounded file:border-0 file:bg-[#EFF6FF] file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-[#3B9EE2]`}
        />
      </div>
      <button
        type="submit"
        className="w-full min-h-[46px] rounded-md bg-[#3B9EE2] text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#2d8fd4] mt-1"
      >
        Upload Document
      </button>
    </form>
  </div>
);

export default UploadDocumentForm;
