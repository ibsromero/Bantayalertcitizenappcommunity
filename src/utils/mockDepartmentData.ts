/**
 * MOCK DEPARTMENT DATA
 * 
 * This provides fallback data for the department dashboard when the Edge Function
 * is not deployed or not accessible. This allows testing the UI without server deployment.
 */

export const MOCK_SOS_ALERTS = [
  {
    id: "sos_mock_001",
    userEmail: "maria.santos@email.com",
    userName: "Maria Santos",
    contactNumber: "+63 917 123 4567",
    location: { 
      lat: 14.6507, 
      lng: 121.1029, 
      address: "Brgy. Tumana, Marikina City - Near Marikina River"
    },
    details: "House is flooding rapidly, water level rising. Need immediate evacuation assistance.",
    priority: "critical" as const,
    status: "active" as const,
    created_at: new Date(Date.now() - 1800000).toISOString(),
    updated_at: new Date().toISOString(),
    responded_by: null,
    resolution: null
  },
  {
    id: "sos_mock_002",
    userEmail: "juan.cruz@email.com",
    userName: "Juan Cruz",
    contactNumber: "+63 918 234 5678",
    location: { 
      lat: 14.6760, 
      lng: 121.0437, 
      address: "123 Commonwealth Ave, Quezon City"
    },
    details: "Elderly person trapped on second floor due to flooding. Medical assistance needed.",
    priority: "high" as const,
    status: "responding" as const,
    created_at: new Date(Date.now() - 3600000).toISOString(),
    updated_at: new Date().toISOString(),
    responded_by: "Emergency Responder",
    resolution: null,
    responseProgress: "enroute"
  },
  {
    id: "sos_mock_003",
    userEmail: "ana.reyes@email.com",
    userName: "Ana Reyes",
    contactNumber: "+63 919 345 6789",
    location: { 
      lat: 14.5995, 
      lng: 120.9842, 
      address: "Barangay Pio del Pilar, Makati City"
    },
    details: "Power outage and strong winds. Tree fell near house, blocking exit.",
    priority: "medium" as const,
    status: "active" as const,
    created_at: new Date(Date.now() - 7200000).toISOString(),
    updated_at: new Date().toISOString(),
    responded_by: null,
    resolution: null
  },
  {
    id: "sos_mock_004",
    userEmail: "pedro.garcia@email.com",
    userName: "Pedro Garcia",
    contactNumber: "+63 920 456 7890",
    location: { 
      lat: 14.5243, 
      lng: 121.0193, 
      address: "Barangay Fort Bonifacio, Taguig City"
    },
    details: "Family of 5 stranded on rooftop. Rising floodwater. Please send rescue boat.",
    priority: "critical" as const,
    status: "active" as const,
    created_at: new Date(Date.now() - 900000).toISOString(),
    updated_at: new Date().toISOString(),
    responded_by: null,
    resolution: null
  },
  {
    id: "sos_mock_005",
    userEmail: "rosa.mendoza@email.com",
    userName: "Rosa Mendoza",
    contactNumber: "+63 921 567 8901",
    location: { 
      lat: 14.5547, 
      lng: 121.0244, 
      address: "Mandaluyong City - Near Pasig River"
    },
    details: "Injured person needs medical evacuation. Cut by debris during evacuation attempt.",
    priority: "high" as const,
    status: "resolved" as const,
    created_at: new Date(Date.now() - 10800000).toISOString(),
    updated_at: new Date(Date.now() - 3600000).toISOString(),
    responded_by: "Healthcare Provider",
    resolution: "Patient successfully evacuated to Makati Medical Center. Treated for minor lacerations."
  }
];

export const MOCK_ACTIVE_DISASTERS = [
  {
    id: "disaster_mock_001",
    type: "flood",
    name: "Marikina River Flooding",
    severity: "high",
    location: "Marikina City",
    affectedAreas: ["Brgy. Tumana", "Brgy. Santo Niño", "Brgy. San Roque"],
    affectedPopulation: 1250,
    evacuees: 450,
    evacuationCenters: [
      {
        name: "Marikina Sports Center",
        capacity: 500,
        current: 450,
        address: "Sumulong Highway, Marikina City"
      }
    ],
    status: "active",
    description: "Heavy rainfall causing river overflow. Water level at critical stage.",
    created_at: new Date(Date.now() - 7200000).toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "disaster_mock_002",
    type: "typhoon",
    name: "Typhoon Signal #2 - NCR",
    severity: "medium",
    location: "Metro Manila",
    affectedAreas: ["Quezon City", "Manila", "Pasay"],
    affectedPopulation: 2500,
    evacuees: 820,
    evacuationCenters: [
      {
        name: "QC Memorial Circle Gymnasium",
        capacity: 800,
        current: 520,
        address: "Elliptical Road, Quezon City"
      },
      {
        name: "Rizal Park Gymnasium",
        capacity: 400,
        current: 300,
        address: "Roxas Boulevard, Manila"
      }
    ],
    status: "active",
    description: "Tropical depression affecting NCR with strong winds and heavy rain.",
    created_at: new Date(Date.now() - 14400000).toISOString(),
    updated_at: new Date().toISOString()
  }
];

export const MOCK_HOSPITALS = [
  {
    id: "hosp_mock_001",
    name: "Philippine General Hospital",
    location: "Manila",
    totalBeds: 1500,
    availableBeds: 320,
    emergencyCapacity: 85,
    icuCapacity: 45,
    status: "operational",
    contact: "+63 2 8554 8400",
    updated_at: new Date().toISOString()
  },
  {
    id: "hosp_mock_002",
    name: "Makati Medical Center",
    location: "Makati City",
    totalBeds: 600,
    availableBeds: 142,
    emergencyCapacity: 95,
    icuCapacity: 28,
    status: "operational",
    contact: "+63 2 8888 8999",
    updated_at: new Date().toISOString()
  },
  {
    id: "hosp_mock_003",
    name: "Veterans Memorial Medical Center",
    location: "Quezon City",
    totalBeds: 1000,
    availableBeds: 218,
    emergencyCapacity: 75,
    icuCapacity: 32,
    status: "operational",
    contact: "+63 2 8927 0001",
    updated_at: new Date().toISOString()
  },
  {
    id: "hosp_mock_004",
    name: "Pasig City General Hospital",
    location: "Pasig City",
    totalBeds: 300,
    availableBeds: 87,
    emergencyCapacity: 60,
    icuCapacity: 15,
    status: "operational",
    contact: "+63 2 8643 1411",
    updated_at: new Date().toISOString()
  },
  {
    id: "hosp_mock_005",
    name: "Manila Doctors Hospital",
    location: "Manila",
    totalBeds: 400,
    availableBeds: 93,
    emergencyCapacity: 70,
    icuCapacity: 20,
    status: "operational",
    contact: "+63 2 8558 0888",
    updated_at: new Date().toISOString()
  },
  {
    id: "hosp_mock_006",
    name: "St. Luke's Medical Center - BGC",
    location: "Taguig City",
    totalBeds: 650,
    availableBeds: 175,
    emergencyCapacity: 80,
    icuCapacity: 35,
    status: "operational",
    contact: "+63 2 7789 7700",
    updated_at: new Date().toISOString()
  },
  {
    id: "hosp_mock_007",
    name: "Taguig-Pateros District Hospital",
    location: "Taguig City",
    totalBeds: 200,
    availableBeds: 58,
    emergencyCapacity: 40,
    icuCapacity: 12,
    status: "operational",
    contact: "+63 2 8789 2345",
    updated_at: new Date().toISOString()
  },
  {
    id: "hosp_mock_008",
    name: "Las Piñas General Hospital",
    location: "Las Piñas City",
    totalBeds: 350,
    availableBeds: 82,
    emergencyCapacity: 55,
    icuCapacity: 18,
    status: "operational",
    contact: "+63 2 8874 0101",
    updated_at: new Date().toISOString()
  }
];

const totalBeds = MOCK_HOSPITALS.reduce((sum, h) => sum + h.totalBeds, 0);
const availableBeds = MOCK_HOSPITALS.reduce((sum, h) => sum + h.availableBeds, 0);
const occupancyRate = totalBeds > 0 ? (((totalBeds - availableBeds) / totalBeds) * 100).toFixed(1) + '%' : '0%';

export const MOCK_ANALYTICS_SUMMARY = {
  alerts: {
    total: MOCK_SOS_ALERTS.length,
    active: MOCK_SOS_ALERTS.filter(a => a.status === "active").length,
    resolved: MOCK_SOS_ALERTS.filter(a => a.status === "resolved").length,
  },
  disasters: {
    total: MOCK_ACTIVE_DISASTERS.length,
    critical: MOCK_ACTIVE_DISASTERS.filter(d => d.severity === "high").length,
  },
  healthcare: {
    totalHospitals: MOCK_HOSPITALS.length,
    totalBeds,
    availableBeds,
    occupancyRate,
  },
  lastUpdated: new Date().toISOString(),
  
  // Additional data for extended analytics
  totalAlerts: MOCK_SOS_ALERTS.length,
  activeAlerts: MOCK_SOS_ALERTS.filter(a => a.status === "active").length,
  respondingAlerts: MOCK_SOS_ALERTS.filter(a => a.status === "responding").length,
  resolvedAlerts: MOCK_SOS_ALERTS.filter(a => a.status === "resolved").length,
  criticalAlerts: MOCK_SOS_ALERTS.filter(a => a.priority === "critical").length,
  activeDisasters: MOCK_ACTIVE_DISASTERS.length,
  totalEvacuees: MOCK_ACTIVE_DISASTERS.reduce((sum, d) => sum + d.evacuees, 0),
  affectedPopulation: MOCK_ACTIVE_DISASTERS.reduce((sum, d) => sum + d.affectedPopulation, 0),
  hospitals: {
    total: MOCK_HOSPITALS.length,
    operational: MOCK_HOSPITALS.filter(h => h.status === "operational").length,
    totalBeds,
    availableBeds,
    emergencyCapacity: MOCK_HOSPITALS.reduce((sum, h) => sum + h.emergencyCapacity, 0),
    icuCapacity: MOCK_HOSPITALS.reduce((sum, h) => sum + h.icuCapacity, 0)
  },
  alertsByHour: [
    { hour: "00:00", count: 2 },
    { hour: "01:00", count: 1 },
    { hour: "02:00", count: 3 },
    { hour: "03:00", count: 1 },
    { hour: "04:00", count: 2 },
    { hour: "05:00", count: 4 },
    { hour: "06:00", count: 3 },
    { hour: "07:00", count: 5 },
    { hour: "08:00", count: 7 },
    { hour: "09:00", count: 6 },
    { hour: "10:00", count: 4 },
    { hour: "11:00", count: 3 },
    { hour: "12:00", count: 5 },
    { hour: "13:00", count: 4 },
    { hour: "14:00", count: 6 },
    { hour: "15:00", count: 8 },
    { hour: "16:00", count: 5 },
    { hour: "17:00", count: 4 },
    { hour: "18:00", count: 3 },
    { hour: "19:00", count: 2 },
    { hour: "20:00", count: 3 },
    { hour: "21:00", count: 2 },
    { hour: "22:00", count: 1 },
    { hour: "23:00", count: 2 }
  ],
  disastersByType: [
    { type: "Flood", count: 12, severity: "high" },
    { type: "Typhoon", count: 8, severity: "medium" },
    { type: "Earthquake", count: 3, severity: "low" },
    { type: "Fire", count: 5, severity: "medium" },
    { type: "Landslide", count: 2, severity: "high" }
  ]
};

/**
 * Helper to determine if we should use mock data
 * Returns true if the API call fails with any network/server error
 */
export function shouldUseMockData(error: any): boolean {
  if (!error) return false;
  
  const errorMessage = error.message || error.toString();
  return (
    errorMessage.includes("Failed to fetch") ||
    errorMessage.includes("Authentication failed") ||
    errorMessage.includes("Unauthorized") ||
    errorMessage.includes("401") ||
    errorMessage.includes("Invalid token") ||
    errorMessage.includes("connect to server") ||
    errorMessage.includes("Network") ||
    errorMessage.includes("CORS") ||
    errorMessage.includes("Unexpected end of JSON")
  );
}
