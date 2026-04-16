// Mock data for VitalSync healthcare dashboard

// Doctors
export const doctors = [
  {
    id: "d1",
    name: "Dr. Marcus Webb",
    specialty: "Cardiology",
    photo: "https://images.unsplash.com/photo-1758691463626-0ab959babe00?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400",
    available: true,
    rating: 4.9,
    experience: 15,
    hospital: "VitalSync Medical Center",
    department: "Cardiology",
    nextAvailable: "Today, 2:00 PM",
    slots: ["9:00 AM", "10:30 AM", "2:00 PM", "3:30 PM", "4:30 PM"],
    bio: "Dr. Webb is a board-certified cardiologist with over 15 years of experience in interventional cardiology and heart failure management.",
    patients: 248,
  },
  {
    id: "d2",
    name: "Dr. Priya Sharma",
    specialty: "Neurology",
    photo: "https://images.unsplash.com/photo-1612944095914-33fd0a85fcfc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400",
    available: true,
    rating: 4.8,
    experience: 12,
    hospital: "VitalSync Medical Center",
    department: "Neurology",
    nextAvailable: "Today, 3:30 PM",
    slots: ["8:00 AM", "11:00 AM", "3:30 PM", "5:00 PM"],
    bio: "Dr. Sharma specializes in neurological disorders, epilepsy management, and cognitive neuroscience with published research in top journals.",
    patients: 183,
  },
  {
    id: "d3",
    name: "Dr. Elena Vasquez",
    specialty: "General Medicine",
    photo: "https://images.unsplash.com/photo-1673865641073-4479f93a7776?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400",
    available: false,
    rating: 4.7,
    experience: 8,
    hospital: "VitalSync Medical Center",
    department: "Internal Medicine",
    nextAvailable: "Tomorrow, 9:00 AM",
    slots: ["9:00 AM", "10:00 AM", "11:00 AM", "2:00 PM", "3:00 PM"],
    bio: "Dr. Vasquez focuses on preventive care and chronic disease management, building long-term relationships with her patients.",
    patients: 312,
  },
  {
    id: "d4",
    name: "Dr. James Okafor",
    specialty: "Orthopedics",
    photo: "https://images.unsplash.com/photo-1645066928295-2506defde470?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400",
    available: true,
    rating: 4.6,
    experience: 20,
    hospital: "VitalSync Medical Center",
    department: "Orthopedic Surgery",
    nextAvailable: "Today, 4:00 PM",
    slots: ["8:30 AM", "10:00 AM", "1:00 PM", "4:00 PM"],
    bio: "Dr. Okafor is a fellowship-trained orthopedic surgeon specializing in joint replacement, sports injuries, and minimally invasive procedures.",
    patients: 421,
  },
];

// Patients
export const patients = [
  {
    id: "p1",
    name: "Sarah Mitchell",
    age: 34,
    gender: "Female",
    bloodType: "A+",
    photo: "https://images.unsplash.com/photo-1758600587683-d86675a2f6e9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400",
    conditions: ["Hypertension", "Type 2 Diabetes"],
    allergies: ["Penicillin", "Sulfa drugs"],
    phone: "+1 (555) 234-5678",
    email: "sarah.mitchell@email.com",
    address: "142 Maple Street, Boston, MA 02101",
    emergencyContact: "James Mitchell — +1 (555) 876-5432",
    lastVisit: "March 28, 2026",
    weight: "142 lbs",
    height: "5'6\"",
  },
  {
    id: "p2",
    name: "Robert Chen",
    age: 52,
    gender: "Male",
    bloodType: "O-",
    photo: "https://images.unsplash.com/photo-1678940805950-73f2127f9d4e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400",
    conditions: ["Coronary Artery Disease", "Hyperlipidemia"],
    allergies: ["Aspirin"],
    phone: "+1 (555) 345-6789",
    email: "robert.chen@email.com",
    address: "55 Harbor View, Boston, MA 02109",
    emergencyContact: "Linda Chen — +1 (555) 765-4321",
    lastVisit: "April 2, 2026",
    weight: "185 lbs",
    height: "5'10\"",
  },
];

// Appointments
export const appointments = [
  {
    id: "a1",
    patientId: "p1",
    doctorId: "d1",
    date: "2026-04-10",
    time: "10:30 AM",
    status: "scheduled",
    type: "Follow-up",
    notes: "Routine cardiac check-up and medication review",
    location: "Cardiology Wing, Room 204",
  },
  {
    id: "a2",
    patientId: "p1",
    doctorId: "d3",
    date: "2026-04-14",
    time: "2:00 PM",
    status: "scheduled",
    type: "Consultation",
    notes: "Annual wellness examination",
    location: "Internal Medicine, Room 108",
  },
  {
    id: "a3",
    patientId: "p1",
    doctorId: "d2",
    date: "2026-03-28",
    time: "9:00 AM",
    status: "completed",
    type: "Consultation",
    notes: "Headache evaluation and MRI review",
    location: "Neurology Wing, Room 312",
  },
  {
    id: "a4",
    patientId: "p1",
    doctorId: "d1",
    date: "2026-03-05",
    time: "3:30 PM",
    status: "completed",
    type: "Check-up",
    notes: "Echocardiogram review",
    location: "Cardiology Wing, Room 204",
  },
  {
    id: "a5",
    patientId: "p1",
    doctorId: "d4",
    date: "2026-02-18",
    time: "11:00 AM",
    status: "cancelled",
    type: "Follow-up",
    notes: "Knee pain assessment",
    location: "Orthopedics, Room 115",
  },
  {
    id: "a6",
    patientId: "p2",
    doctorId: "d1",
    date: "2026-04-11",
    time: "2:00 PM",
    status: "scheduled",
    type: "Follow-up",
    notes: "Post-procedure cardiac monitoring",
    location: "Cardiology Wing, Room 204",
  },
  {
    id: "a7",
    patientId: "p2",
    doctorId: "d1",
    date: "2026-04-02",
    time: "9:00 AM",
    status: "completed",
    type: "Check-up",
    notes: "Stent follow-up evaluation",
    location: "Cardiology Wing, Room 204",
  },
  {
    id: "a8",
    patientId: "p1",
    doctorId: "d2",
    date: "2026-04-20",
    time: "3:30 PM",
    status: "pending",
    type: "Consultation",
    notes: "Follow-up on recent symptoms and medication adjustment",
    location: "Neurology Wing, Room 312",
  },
  {
    id: "a9",
    patientId: "p2",
    doctorId: "d3",
    date: "2026-04-22",
    time: "10:00 AM",
    status: "pending",
    type: "Follow-up",
    notes: "General health checkup and lab review",
    location: "Internal Medicine, Room 108",
  },
];

// Medical History
export const medicalHistory = [
  {
    id: "m1",
    patientId: "p1",
    date: "2026-03-28",
    type: "visit",
    title: "Neurology Consultation",
    description: "Evaluation for recurring migraines. MRI brain showed no structural abnormalities. Prescribed preventive migraine therapy.",
    doctor: "Dr. Priya Sharma",
    doctorId: "d2",
    severity: "medium",
  },
  {
    id: "m2",
    patientId: "p1",
    date: "2026-03-05",
    type: "lab",
    title: "Cardiac Panel Results",
    description: "Lipid panel: LDL 98 mg/dL, HDL 55 mg/dL. Troponin normal. BNP within normal range. Echocardiogram shows EF 58%.",
    doctor: "Dr. Marcus Webb",
    doctorId: "d1",
    severity: "low",
    attachments: ["Echo Report", "Lab Results"],
  },
  {
    id: "m3",
    patientId: "p1",
    date: "2025-12-15",
    type: "diagnosis",
    title: "Hypertension — Stage 1",
    description: "Diagnosed with Stage 1 Hypertension. BP readings consistently averaging 138/88 mmHg. Initiated lifestyle modifications and antihypertensive therapy.",
    doctor: "Dr. Elena Vasquez",
    doctorId: "d3",
    severity: "medium",
  },
  {
    id: "m4",
    patientId: "p1",
    date: "2025-09-10",
    type: "vaccination",
    title: "Annual Influenza Vaccine",
    description: "Quadrivalent influenza vaccine administered. No adverse reactions observed.",
    doctor: "Dr. Elena Vasquez",
    doctorId: "d3",
    severity: "low",
  },
  {
    id: "m5",
    patientId: "p1",
    date: "2025-06-22",
    type: "procedure",
    title: "Blood Glucose Monitoring Setup",
    description: "Continuous glucose monitor (CGM) fitted. Patient educated on diabetes management. HbA1c: 7.2%.",
    doctor: "Dr. Elena Vasquez",
    doctorId: "d3",
    severity: "medium",
  },
  {
    id: "m6",
    patientId: "p1",
    date: "2025-01-08",
    type: "emergency",
    title: "ER Visit — Chest Pain",
    description: "Presented to Emergency with chest pain and shortness of breath. ECG showed no ST changes. Ruled out ACS. Admitted for 24h observation. Discharged with cardiology follow-up.",
    doctor: "Dr. Marcus Webb",
    doctorId: "d1",
    severity: "high",
  },
  {
    id: "m7",
    patientId: "p1",
    date: "2024-08-15",
    type: "diagnosis",
    title: "Type 2 Diabetes Mellitus",
    description: "Fasting glucose 142 mg/dL, HbA1c 7.8%. Diagnosed with Type 2 Diabetes. Initiated Metformin therapy and dietary consultation.",
    doctor: "Dr. Elena Vasquez",
    doctorId: "d3",
    severity: "high",
  },
];

// Prescriptions
export const prescriptions = [
  {
    id: "rx1",
    patientId: "p1",
    doctorId: "d1",
    date: "2026-03-05",
    expiryDate: "2026-09-05",
    status: "active",
    pharmacy: "CVS Pharmacy — 200 Commonwealth Ave",
    notes: "Take with food. Monitor for dizziness.",
    medications: [
      {
        name: "Lisinopril",
        dosage: "10 mg",
        frequency: "Once daily",
        duration: "6 months",
        refills: 5,
        instructions: "Take in the morning with or without food.",
      },
      {
        name: "Atorvastatin",
        dosage: "20 mg",
        frequency: "Once daily at bedtime",
        duration: "6 months",
        refills: 5,
        instructions: "Take at bedtime. Avoid grapefruit juice.",
      },
    ],
  },
  {
    id: "rx2",
    patientId: "p1",
    doctorId: "d3",
    date: "2025-12-15",
    expiryDate: "2026-06-15",
    status: "active",
    pharmacy: "Walgreens — 150 Boylston Street",
    notes: "Regular blood sugar monitoring required.",
    medications: [
      {
        name: "Metformin HCl",
        dosage: "500 mg",
        frequency: "Twice daily with meals",
        duration: "Ongoing",
        refills: 11,
        instructions: "Take with breakfast and dinner to reduce GI side effects.",
      },
    ],
  },
  {
    id: "rx3",
    patientId: "p1",
    doctorId: "d2",
    date: "2026-03-28",
    expiryDate: "2026-09-28",
    status: "active",
    pharmacy: "CVS Pharmacy — 200 Commonwealth Ave",
    notes: "For migraine prevention. May cause drowsiness.",
    medications: [
      {
        name: "Topiramate",
        dosage: "25 mg",
        frequency: "Once daily at bedtime",
        duration: "6 months",
        refills: 3,
        instructions: "Start with 25mg and increase as directed. Stay hydrated.",
      },
      {
        name: "Sumatriptan",
        dosage: "50 mg",
        frequency: "As needed for acute migraine",
        duration: "PRN",
        refills: 2,
        instructions: "Take at onset of migraine. Do not exceed 2 doses per day.",
      },
    ],
  },
  {
    id: "rx4",
    patientId: "p1",
    doctorId: "d4",
    date: "2025-11-10",
    expiryDate: "2026-02-10",
    status: "expired",
    pharmacy: "Walgreens — 150 Boylston Street",
    notes: "Short course for knee inflammation.",
    medications: [
      {
        name: "Naproxen Sodium",
        dosage: "500 mg",
        frequency: "Twice daily",
        duration: "3 months",
        refills: 0,
        instructions: "Take with food or milk. Avoid alcohol.",
      },
    ],
  },
];

// Vital Signs
export const vitalSigns = [
  { date: "Mar 5", heartRate: 78, bloodPressureSys: 138, bloodPressureDia: 88, temperature: 98.4, oxygenSat: 98, weight: 142 },
  { date: "Mar 12", heartRate: 75, bloodPressureSys: 134, bloodPressureDia: 85, temperature: 98.6, oxygenSat: 97, weight: 141 },
  { date: "Mar 19", heartRate: 80, bloodPressureSys: 132, bloodPressureDia: 84, temperature: 98.5, oxygenSat: 99, weight: 141 },
  { date: "Mar 26", heartRate: 72, bloodPressureSys: 128, bloodPressureDia: 82, temperature: 98.3, oxygenSat: 98, weight: 140 },
  { date: "Apr 2", heartRate: 74, bloodPressureSys: 126, bloodPressureDia: 80, temperature: 98.6, oxygenSat: 99, weight: 142 },
  { date: "Apr 8", heartRate: 71, bloodPressureSys: 124, bloodPressureDia: 79, temperature: 98.4, oxygenSat: 98, weight: 141 },
];

export const getPatientDataSeed = (currentPatient) => {
  if (!currentPatient) return null;

  const matchedPatient =
    patients.find((patient) => patient.email === currentPatient.email) ??
    patients.find((patient) => patient.id === currentPatient.id) ??
    patients[0];

  return {
    ...matchedPatient,
    ...currentPatient,
    id: matchedPatient?.id ?? currentPatient.id,
    name: currentPatient.name || matchedPatient?.name || "Patient",
    photo: currentPatient.photo || matchedPatient?.photo || "",
    email: currentPatient.email || matchedPatient?.email || "",
    phone: currentPatient.phone || matchedPatient?.phone || "",
    dob: currentPatient.dob || matchedPatient?.dob || "",
    conditions: currentPatient.conditions?.length ? currentPatient.conditions : matchedPatient?.conditions ?? [],
    allergies: currentPatient.allergies?.length ? currentPatient.allergies : matchedPatient?.allergies ?? [],
  };
};

export const getDoctorDataSeed = (currentDoctor) => {
  if (!currentDoctor) return null;

  const matchedDoctor =
    doctors.find((doctor) => doctor.name === currentDoctor.name) ??
    doctors.find((doctor) => doctor.id === currentDoctor.id) ??
    doctors[0];

  return {
    ...matchedDoctor,
    ...currentDoctor,
    id: matchedDoctor?.id ?? currentDoctor.id,
    name: currentDoctor.name || matchedDoctor?.name || "Doctor",
    photo: currentDoctor.photo || matchedDoctor?.photo || "",
    specialty: currentDoctor.specialty || matchedDoctor?.specialty || "General Medicine",
    department: currentDoctor.department || matchedDoctor?.department || "General Medicine",
    slots: currentDoctor.slots?.length ? currentDoctor.slots : matchedDoctor?.slots ?? [],
  };
};

export const getAppointmentsForPatient = (currentPatient, sourceAppointments = appointments) => {
  const patientSeed = getPatientDataSeed(currentPatient);
  if (!patientSeed) return [];

  return sourceAppointments.filter((appointment) => appointment.patientId === patientSeed.id);
};

export const getAppointmentsForDoctor = (currentDoctor, sourceAppointments = appointments) => {
  const doctorSeed = getDoctorDataSeed(currentDoctor);
  if (!doctorSeed) return [];

  return sourceAppointments.filter((appointment) => appointment.doctorId === doctorSeed.id);
};

export const getMedicalHistoryForPatient = (currentPatient) => {
  const patientSeed = getPatientDataSeed(currentPatient);
  if (!patientSeed) return [];

  return medicalHistory.filter((entry) => entry.patientId === patientSeed.id);
};

export const getPrescriptionsForPatient = (currentPatient) => {
  const patientSeed = getPatientDataSeed(currentPatient);
  if (!patientSeed) return [];

  return prescriptions.filter((prescription) => prescription.patientId === patientSeed.id);
};

export const getPatientsForDoctor = (currentDoctor, sourceAppointments = appointments) => {
  const doctorAppointments = getAppointmentsForDoctor(currentDoctor, sourceAppointments);
  const patientIds = [...new Set(doctorAppointments.map((appointment) => appointment.patientId))];

  return patients.filter((patient) => patientIds.includes(patient.id));
};
