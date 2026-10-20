import type { Region } from '../types/types';

function RegionCard({ id, name, counts }: Region) {
    return (
        <div className="bg-blue-200 rounded mx-2 my-5 px-2 py-4">
            {/* Title content */}
            <div>
                <h2 className="text-xl font-bold">{id}. {name}</h2>
            </div>

            <div className="bg-blue-300 rounded-lg mt-2 mx-2 px-2 py-2 text-left">
                {/* Region report table */}
                <table className="table-auto w-full">
                    <thead>
                        <tr>
                            <th>Time Observed</th>
                            <th>Dry</th>
                            <th>Damp</th>
                            <th>Wet</th>
                            <th>Standing Water</th>
                        </tr>
                    </thead>
                    {/* Fields */}
                    <tbody>
                        {/* Row specifications and data mapped, if no data within last 12 hours at all then just show for card "No observations within last 12 hours submitted"*/}
                        <tr>
                            <td>Last 10 minutes</td>
                            <td>{counts.last_10_minutes['Dry'] ?? 0}</td>
                            <td>{counts.last_10_minutes['Damp'] ?? 0}</td>
                            <td>{counts.last_10_minutes['Wet'] ?? 0}</td>
                            <td>{counts.last_10_minutes['Standing water'] ?? 0}</td>
                        </tr>

                        {/* Last hour */}
                        <tr>
                            <td>Last hour</td>
                            <td>{counts.last_hour['Dry'] ?? 0}</td>
                            <td>{counts.last_hour['Damp'] ?? 0}</td>
                            <td>{counts.last_hour['Wet'] ?? 0}</td>
                            <td>{counts.last_hour['Standing water'] ?? 0}</td>
                        </tr>

                        {/* Last 12 hours */}
                        <tr>
                            <td>Last 12 hours</td>
                            <td>{counts.last_12_hours['Dry'] ?? 0}</td>
                            <td>{counts.last_12_hours['Damp'] ?? 0}</td>
                            <td>{counts.last_12_hours['Wet'] ?? 0}</td>
                            <td>{counts.last_12_hours['Standing water'] ?? 0}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default RegionCard;