import type { Region } from '../types/types';

function RegionCard( {id, name}: Region ) {
    return (
        <div className="bg-blue-100 rounded mx-2 my-5 px-2 py-4">
            {/* Title content */}
            <div>
                <h1 className="xl">{id}. {name}</h1>
            </div>
            
            {/* Region report table */}
        </div>
    )
}

export default RegionCard;