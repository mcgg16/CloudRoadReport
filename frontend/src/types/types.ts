export type RegionCounts = {
  last_10_minutes: Record<string, number>;
  last_hour: Record<string, number>;
  last_12_hours: Record<string, number>;
};

export type Region = {
  id: number;
  name: string;
  counts: RegionCounts; // Added for region specifications to not make a horrible optinal json
};

export type Conditions = {
  id: number; 
  name: string; 
  description: string; 
}

export type Names = {
  id: number; 
  name: string;
}