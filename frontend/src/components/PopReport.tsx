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
                    <h2 className="text-lg font-bold">Submit a Report</h2>

                    {/* Close pop-up */}
                    <button
                        type="button"
                        onClick={onClose}
                        className="text-xl text-gray-600 hover:text-gray-400"
                    >
                        x
                    </button>
                </div>

                {/* Rest of pop-up body fields and button */}
                <div className="flex flex-col items-center text-center">
                    {/* All the data fields */}
                    <div className="flex flex-col items-center justify-center py-2 my-2">
                        {/* Region */}
                        <div>
                            <h3 className="text-lg font-semibold">Region</h3>
                            <p>Select the region to report</p>
                        </div>

                        {/* Condition with description */}
                        <div>
                            <h3 className="text-lg font-semibold mt-3">Select road condition</h3>
                            <div className="grid grid-cols-2">
                                <div>
                                    <p>1</p>
                                    <p>2</p>
                                </div>
                                <div>
                                    <p>3</p>
                                    <p>4</p>
                                </div>
                            </div>

                        </div>

                        {/* Time column */}
                        <div>
                            <h3 className="text-lg font-semibold mt-3">Time of observation</h3>
                            <div className="flex flex-row">
                                <p>Hour</p>
                                <p>Minutes</p>
                                <p>am/pm</p>
                            </div>
                        </div>
                    </div>


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