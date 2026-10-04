export const INITIAL_FLOORS = [
  {
    id: 'L1',
    name: 'Level 1 (Ground & EV)',
    description: 'Direct Entry • Fast EV Charging • Handicap Accessible',
    slots: [
      { id: 'L1-01', name: 'Bay 01 (IoT Hardware)', type: 'hardware', status: 'VACANT', isHardware: true, carColor: null },
      { id: 'L1-02', name: 'Bay 02 (EV Supercharger)', type: 'ev', status: 'OCCUPIED', isHardware: false, carColor: '#0ea5e9' },
      { id: 'L1-03', name: 'Bay 03 (Standard)', type: 'standard', status: 'VACANT', isHardware: false, carColor: null },
      { id: 'L1-04', name: 'Bay 04 (Standard)', type: 'standard', status: 'VACANT', isHardware: false, carColor: null },
      { id: 'L1-05', name: 'Bay 05 (Handicap Priority)', type: 'handicap', status: 'VACANT', isHardware: false, carColor: null },
      { id: 'L1-06', name: 'Bay 06 (EV Fast Plug)', type: 'ev', status: 'VACANT', isHardware: false, carColor: null },
      { id: 'L1-07', name: 'Bay 07 (Standard)', type: 'standard', status: 'OCCUPIED', isHardware: false, carColor: '#ef4444' },
      { id: 'L1-08', name: 'Bay 08 (VIP Reserved)', type: 'vip', status: 'RESERVED', isHardware: false, carColor: '#f59e0b' }
    ]
  },
  {
    id: 'L2',
    name: 'Level 2 (Covered Deck)',
    description: 'Mid-Level • Weather-Shielded • 24/7 Security Patrol',
    slots: [
      { id: 'L2-01', name: 'Bay 01 (Standard)', type: 'standard', status: 'VACANT', isHardware: false, carColor: null },
      { id: 'L2-02', name: 'Bay 02 (Standard)', type: 'standard', status: 'VACANT', isHardware: false, carColor: null },
      { id: 'L2-03', name: 'Bay 03 (Standard)', type: 'standard', status: 'OCCUPIED', isHardware: false, carColor: '#3b82f6' },
      { id: 'L2-04', name: 'Bay 04 (Standard)', type: 'standard', status: 'VACANT', isHardware: false, carColor: null },
      { id: 'L2-05', name: 'Bay 05 (EV Standard)', type: 'ev', status: 'VACANT', isHardware: false, carColor: null },
      { id: 'L2-06', name: 'Bay 06 (Standard)', type: 'standard', status: 'VACANT', isHardware: false, carColor: null },
      { id: 'L2-07', name: 'Bay 07 (Standard)', type: 'standard', status: 'VACANT', isHardware: false, carColor: null },
      { id: 'L2-08', name: 'Bay 08 (Standard)', type: 'standard', status: 'OCCUPIED', isHardware: false, carColor: '#a855f7' }
    ]
  },
  {
    id: 'L3',
    name: 'Level 3 (Rooftop Canopy)',
    description: 'Open Deck • Solar Shading • Extended Stay Economy',
    slots: [
      { id: 'L3-01', name: 'Bay 01 (Standard)', type: 'standard', status: 'VACANT', isHardware: false, carColor: null },
      { id: 'L3-02', name: 'Bay 02 (Standard)', type: 'standard', status: 'VACANT', isHardware: false, carColor: null },
      { id: 'L3-03', name: 'Bay 03 (Standard)', type: 'standard', status: 'VACANT', isHardware: false, carColor: null },
      { id: 'L3-04', name: 'Bay 04 (Standard)', type: 'standard', status: 'VACANT', isHardware: false, carColor: null },
      { id: 'L3-05', name: 'Bay 05 (Solar EV)', type: 'ev', status: 'VACANT', isHardware: false, carColor: null },
      { id: 'L3-06', name: 'Bay 06 (Standard)', type: 'standard', status: 'OCCUPIED', isHardware: false, carColor: '#f97316' },
      { id: 'L3-07', name: 'Bay 07 (Standard)', type: 'standard', status: 'VACANT', isHardware: false, carColor: null },
      { id: 'L3-08', name: 'Bay 08 (Standard)', type: 'standard', status: 'VACANT', isHardware: false, carColor: null }
    ]
  }
];
