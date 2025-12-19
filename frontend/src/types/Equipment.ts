export type EquipmentType = 'Machine' | 'Vessel' | 'Tank' | 'Mixer';

export type EquipmentStatus = 'Active' | 'Inactive' | 'Under Maintenance';

export interface Equipment {
    id: number;
    name: string;
    type: EquipmentType;
    status: EquipmentStatus;
    lastCleanedDate: string;
}
