import React from 'react';

const OTPModal = ({ isOpen, onClose, otpCode, setOtpCode, handleVerifyOTP }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white p-6 rounded-2xl shadow-2xl w-full max-w-sm relative">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl"
                >
                    ✕
                </button>
                <h3 className="text-xl font-bold mb-2 text-gray-800">Enter OTP</h3>
                <p className="text-sm text-gray-500 mb-4">
                    Ask patient for the 6-digit code sent to their phone.
                </p>
                <form onSubmit={handleVerifyOTP} className="space-y-4">
                    <input
                        type="text"
                        placeholder="• • • • • •"
                        className="w-full border-2 border-gray-200 p-3 rounded-xl text-center text-3xl tracking-widest focus:border-indigo-500 focus:outline-none"
                        maxLength={6}
                        value={otpCode}
                        onChange={e => setOtpCode(e.target.value)}
                        autoFocus
                    />
                    <button
                        type="submit"
                        className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-xl hover:from-indigo-700 hover:to-purple-700 font-medium shadow-lg transition-all"
                    >
                        Verify & Grant Access
                    </button>
                </form>
            </div>
        </div>
    );
};

export default OTPModal;
