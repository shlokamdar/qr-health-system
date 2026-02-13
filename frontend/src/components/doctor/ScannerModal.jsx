import React from 'react';
import { Scanner } from '@yudiel/react-qr-scanner';

const ScannerModal = ({ isOpen, onClose, onScan, error, onError, setScannerError, setIsCameraLoading }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white p-6 rounded-2xl shadow-2xl w-full max-w-md relative">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl z-10"
                >
                    ✕
                </button>
                <h3 className="text-xl font-bold mb-4 text-gray-800">Scan Patient QR Code</h3>

                {error ? (
                    <div className="space-y-4">
                        <div className="aspect-square bg-red-50 rounded-xl flex flex-col items-center justify-center p-6 text-center">
                            <span className="text-6xl mb-4">❌</span>
                            <p className="text-red-600 font-medium">{error}</p>
                        </div>
                        <button
                            onClick={() => {
                                setScannerError(null);
                                setIsCameraLoading(true);
                            }}
                            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-xl hover:from-indigo-700 hover:to-purple-700 font-medium transition-all"
                        >
                            🔄 Retry
                        </button>
                    </div>
                ) : (
                    <div className="aspect-square bg-gray-100 rounded-xl overflow-hidden">
                        <Scanner
                            onScan={onScan}
                            onError={onError}
                            components={{
                                audio: false,
                                finder: true
                            }}
                            constraints={{
                                facingMode: 'environment',
                                aspectRatio: 1
                            }}
                            formats={['qr_code', 'data_matrix']}
                            scanDelay={300}
                        />
                    </div>
                )}

                <p className="text-sm text-gray-500 mt-4 text-center">
                    {error ? 'Please grant camera permission to scan QR codes' : 'Point camera at patient\'s Health ID QR code'}
                </p>
            </div>
        </div>
    );
};

export default ScannerModal;
