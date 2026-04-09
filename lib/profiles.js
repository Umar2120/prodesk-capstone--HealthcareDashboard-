export const patientProfiles = [
  {
    id: 'patient-1',
    name: 'Sarah Mitchell',
    role: 'Patient',
    age: '34 yrs',
    status: 'A+',
    bloodType: 'A+',
    allergies: 'Penicillin, Sulfa drugs',
    conditions: 'Hypertension, Type 2 Diabetes',
    avatar: '👩‍🦰',
    appointments: [
      {
        id: 1,
        doctor: 'Dr. Elena Vasquez',
        specialty: 'General Medicine',
        date: '2026-04-14',
        time: '2:00 PM',
        type: 'Consultation',
        status: 'Scheduled',
        location: 'Internal Medicine, Room 108',
        reason: 'Annual wellness examination'
      },
      {
        id: 2,
        doctor: 'Dr. Marcus Webb',
        specialty: 'Cardiology',
        date: '2026-04-10',
        time: '10:30 AM',
        type: 'Follow-up',
        status: 'Scheduled',
        location: 'Cardiology Wing, Room 204',
        reason: 'Routine cardiac check-up and medication review'
      },
      {
        id: 3,
        doctor: 'Dr. Priya Sharma',
        specialty: 'Neurology',
        date: '2026-03-28',
        time: '9:00 AM',
        type: 'Consultation',
        status: 'Completed',
        location: 'Neurology Wing, Room 312',
        reason: 'Headache evaluation and MRI review'
      }
    ],
    prescriptions: [
      {
        id: 1,
        name: 'Lisinopril',
        dose: '10 mg',
        prescriber: 'Dr. Marcus Webb',
        dateStarted: '2026-03-05',
        status: 'Active'
      },
      {
        id: 2,
        name: 'Atorvastatin',
        dose: '20 mg',
        prescriber: 'Dr. Marcus Webb',
        dateStarted: '2026-03-05',
        status: 'Active'
      },
      {
        id: 3,
        name: 'Metformin HCL',
        dose: '500 mg',
        prescriber: 'Dr. Elena Vasquez',
        dateStarted: '2025-12-15',
        status: 'Active'
      },
      {
        id: 4,
        name: 'Topiramate',
        dose: '25 mg',
        prescriber: 'Dr. Priya Sharma',
        dateStarted: '2026-03-28',
        status: 'Active'
      },
      {
        id: 5,
        name: 'Sumatriptan',
        dose: '50 mg',
        prescriber: 'Dr. Priya Sharma',
        dateStarted: '2026-03-28',
        status: 'Active'
      }
    ],
    medicalHistory: [
      {
        date: '2026-03-28',
        title: 'Neurology Consultation',
        type: 'Clinical Visit',
        doctor: 'Dr. Priya Sharma',
        note: 'Evaluation for recurring migraines. MRI brain showed no structural abnormalities. Prescribed preventive migraine therapy.'
      },
      {
        date: '2026-03-05',
        title: 'Cardiac Panel Results',
        type: 'Lab Results',
        doctor: 'Dr. Marcus Webb',
        note: 'Lipid panel: LDL 98 mg/dL, HDL 55 mg/dL. Troponin normal. BNP within normal range. Echocardiogram shows EF 58%.'
      },
      {
        date: '2026-02-20',
        title: 'Hypertension Management',
        type: 'Clinical Visit',
        doctor: 'Dr. Elena Vasquez',
        note: 'BP readings stable on current regimen. Lisinopril dosage maintained. Patient shows good compliance.'
      }
    ],
    vitals: {
      heartRate: { value: 71, unit: 'bpm' },
      bloodPressure: { value: '124/79', unit: 'mmHg' },
      o2Saturation: { value: 98, unit: '%' },
      temperature: { value: 98.4, unit: '°F' }
    }
  },
  {
    id: 'patient-2',
    name: 'John Anderson',
    role: 'Patient',
    age: '52 yrs',
    status: 'O+',
    bloodType: 'O+',
    allergies: 'None',
    conditions: 'Asthma, Seasonal Allergies',
    avatar: '👨‍🦱',
    appointments: [
      {
        id: 1,
        doctor: 'Dr. Lisa Chen',
        specialty: 'Pulmonology',
        date: '2026-04-12',
        time: '11:00 AM',
        type: 'Follow-up',
        status: 'Scheduled',
        location: 'Pulmonology, Room 205',
        reason: 'Asthma control assessment'
      },
      {
        id: 2,
        doctor: 'Dr. James Park',
        specialty: 'Allergy & Immunology',
        date: '2026-04-20',
        time: '3:30 PM',
        type: 'Consultation',
        status: 'Scheduled',
        location: 'Allergy Wing, Room 110',
        reason: 'Seasonal allergy management'
      }
    ],
    prescriptions: [
      {
        id: 1,
        name: 'Albuterol Inhaler',
        dose: '90 mcg/puff',
        prescriber: 'Dr. Lisa Chen',
        dateStarted: '2025-11-10',
        status: 'Active'
      },
      {
        id: 2,
        name: 'Fluticasone/Salmeterol Inhaler',
        dose: '110/21 mcg',
        prescriber: 'Dr. Lisa Chen',
        dateStarted: '2025-11-10',
        status: 'Active'
      }
    ],
    medicalHistory: [
      {
        date: '2026-04-01',
        title: 'Pulmonary Function Test',
        type: 'Procedure',
        doctor: 'Dr. Lisa Chen',
        note: 'FEV1 75% predicted. Good response to bronchodilator. Asthma well-controlled.'
      }
    ],
    vitals: {
      heartRate: { value: 68, unit: 'bpm' },
      bloodPressure: { value: '118/76', unit: 'mmHg' },
      o2Saturation: { value: 99, unit: '%' },
      temperature: { value: 98.1, unit: '°F' }
    }
  }
];

export const doctorProfiles = [
  {
    id: 'doctor-1',
    name: 'Dr. Elena Vasquez',
    role: 'Doctor',
    specialty: 'General Medicine',
    licenseNumber: 'LIC-2018-45892',
    yearsExperience: '12 yrs',
    avatar: '👩‍⚕️',
    patientQueue: [
      { name: 'Jordan Lee', reason: 'Follow-up review', time: '09:15 AM', status: 'In Progress' },
      { name: 'Ava Singh', reason: 'Lab result discussion', time: '09:45 AM', status: 'Waiting' },
      { name: 'Ethan Kim', reason: 'Medication update', time: '10:30 AM', status: 'Waiting' }
    ],
    schedule: [
      { time: '08:30 AM', activity: 'New patient consult' },
      { time: '10:00 AM', activity: 'Chart review session' },
      { time: '01:30 PM', activity: 'Team care huddle' },
      { time: '03:00 PM', activity: 'Patient follow-ups' }
    ]
  },
  {
    id: 'doctor-2',
    name: 'Dr. Marcus Webb',
    role: 'Doctor',
    specialty: 'Cardiology',
    licenseNumber: 'LIC-2015-67234',
    yearsExperience: '15 yrs',
    avatar: '👨‍⚕️',
    patientQueue: [
      { name: 'Michael Torres', reason: 'Cardiac workup', time: '08:45 AM', status: 'In Progress' },
      { name: 'Patricia Johnson', reason: 'EKG review', time: '09:30 AM', status: 'Waiting' },
      { name: 'David Chen', reason: 'Medication adjustment', time: '10:15 AM', status: 'Waiting' }
    ],
    schedule: [
      { time: '08:00 AM', activity: 'ICU rounds' },
      { time: '09:00 AM', activity: 'Echo lab review' },
      { time: '02:00 PM', activity: 'Cath lab procedures' }
    ]
  }
];
