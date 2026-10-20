import { useEffect, useState } from 'react';
import type { Conditions, Names } from '../types/types';

type OpenPopReportState = {
    open: boolean;
    onClose: () => void;
}

function PopReport({ open, onClose }: OpenPopReportState) {
    const [loading, setLoading] = useState(false);

    // Not opened, doesn't return anything
    if (!open) {
        return null;
    }

    // Submit the report 
    async function submitReport() {
        // Nothing for now, will be the one making call to API
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-black/40"
                onClick={onClose}
            />

            <div className="relative w-100 z-10 bg-white rounded-2xl p-6">
                <div className="flex justify-between gap-8">
                    <h1 className="text-lg">Submit a Report</h1>

                    {/* Close pop-up */}
                    <button
                        type="button"
                        onClick={onClose}
                        className="text-xl text-gray-600 hover:text-gray-400"
                    >
                        x
                    </button>
                </div>

                {/* Rest of pop-up body */}
                <div className="flex flex-col items-center">
                    {/* All the data fields */}


                    {/* Close the pop-up */}
                    <button
                        type="button"
                        onClick={submitReport}
                        disabled={loading}
                        className="mt-6 text-white font-bold bg-blue-400 hover:bg-blue-700 py-2 px-4 rounded-2xl disabled:opacity-50"
                    >
                        {loading ? 'Submitting...' : 'Submit'}
                    </button>
                </div>

            </div>
        </div>
    )
}

export default PopReport;