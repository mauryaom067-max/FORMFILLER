// ============================================================
// FORMFILLER — MOCK DATA
// All data below is illustrative mock data for prototyping only.
// ============================================================


// ============================================================
// APPLICANT
// ============================================================

export const applicant = {
  name: 'Ishaan Verma',
  email: 'ishaan.verma@gmail.com',
  phone: '**** ** 4821',
  joined: '3 Sep 2026',
  avatarInitials: 'IV',
}


// ============================================================
// JEE MAIN FORM
// ============================================================

export const jeeMainForm = {
  id: 'jee-main',
  name: 'JEE Main',
  fullName: 'Joint Entrance Examination — Main',
  session: 'Session 2, 2027',

  fee: 1000,
  serviceFee: 249,

  documents: [
    {
      key: 'aadhaar',
      label: 'Aadhaar Card',
      hint: 'Used to verify identity details',
      inVault: true,
      required: true,
    },

    {
      key: 'photo',
      label: 'Passport Size Photograph',
      hint: 'Recent passport-size photo with a plain background',
      inVault: true,
      required: true,
    },

    {
      key: 'signature',
      label: 'Signature',
      hint: 'Signature on white paper, scanned or photographed',
      inVault: false,
      required: true,
    },

    {
      key: 'marksheet_10',
      label: 'Class 10 Marksheet',
      hint: 'Used to auto-fill academic details',
      inVault: true,
      required: true,
    },

    {
      key: 'marksheet_12',
      label: 'Class 12 Marksheet',
      hint: 'Used to verify Class 12 academic details',
      inVault: false,
      required: true,
    },

    {
      key: 'caste_certificate',
      label: 'Caste Certificate',
      hint: 'Required for candidates applying under applicable reserved categories',
      inVault: false,
      required: false,
      conditional: true,
      applicableFor: ['SC', 'ST', 'OBC'],
    },
  ],
}


// ============================================================
// VAULT DOCUMENTS
// ============================================================

export const vaultDocuments = [
  {
    id: 'doc_aadhaar',
    key: 'aadhaar',
    label: 'Aadhaar Card',
    type: 'Identity',
    addedOn: '12 Jan 2026',
    size: '412 KB',
    masked: 'XXXX XXXX 4821',
  },

  {
    id: 'doc_photo',
    key: 'photo',
    label: 'Passport Size Photograph',
    type: 'Photo',
    addedOn: '12 Jan 2026',
    size: '186 KB',
  },

  {
    id: 'doc_marksheet_10',
    key: 'marksheet_10',
    label: 'Class 10 Marksheet',
    type: 'Academic',
    addedOn: '15 Jan 2026',
    size: '1.1 MB',
  },

  {
    id: 'doc_signature_old',
    key: 'signature',
    label: 'Signature (2024)',
    type: 'Signature',
    addedOn: '3 Feb 2024',
    size: '58 KB',
  },
]


// ============================================================
// EXTRACTED / APPLICATION FORM DATA
// ============================================================
//
// Rule:
// - If information is available in uploaded documents,
//   source is provided and locked = true.
// - If information is not available,
//   source = null and locked = false.
// ============================================================

export const extractedFields = {

  // ----------------------------------------------------------
  // 1. PERSONAL DETAILS
  // ----------------------------------------------------------

  personal: [
    {
      key: 'fullName',
      label: 'Full Name',
      value: 'Ishaan Verma',
      source: 'Aadhaar Card',
      locked: true,
    },

    {
      key: 'dateOfBirth',
      label: 'Date of Birth',
      value: '14 Mar 2009',
      source: 'Aadhaar Card',
      locked: true,
    },

    {
      key: 'gender',
      label: 'Gender',
      value: 'Male',
      source: 'Aadhaar Card',
      locked: true,
    },

    {
      key: 'nationality',
      label: 'Nationality',
      value: 'Indian',
      source: 'Aadhaar Card',
      locked: true,
    },

    {
      key: 'fatherName',
      label: "Father's / Guardian's Name",
      value: 'Rakesh Verma',
      source: '10th Marksheet',
      locked: true,
    },

    {
      key: 'motherName',
      label: "Mother's / Guardian's Name",
      value: '',
      source: null,
      locked: false,
    },

    {
      key: 'category',
      label: 'Category',
      value: 'General',
      source: null,
      locked: false,
    },

    {
      key: 'categoryCertificate',
      label: 'Valid Category Certificate Available',
      value: '',
      source: null,
      locked: false,
    },

    {
      key: 'certificateNumber',
      label: 'Category Certificate Number',
      value: '',
      source: null,
      locked: false,
    },

    {
      key: 'certificateAuthority',
      label: 'Certificate Issuing Authority',
      value: '',
      source: null,
      locked: false,
    },

    {
      key: 'certificateIssueDate',
      label: 'Certificate Issue Date',
      value: '',
      source: null,
      locked: false,
    },

    {
      key: 'placeOfBirth',
      label: 'Place of Birth',
      value: '',
      source: null,
      locked: false,
    },

    {
      key: 'annualFamilyIncome',
      label: 'Annual Family Income',
      value: '',
      source: null,
      locked: false,
    },

    {
      key: 'medium',
      label: 'Medium of Preparation / Schooling',
      value: 'English',
      source: null,
      locked: false,
    },

    {
      key: 'identificationNumber',
      label: 'Identification / APAAR ID',
      value: '',
      source: null,
      locked: false,
    },
  ],


  // ----------------------------------------------------------
  // 2. DISABILITY DETAILS
  // ----------------------------------------------------------

  disability: [
    {
      key: 'pwbd',
      label: 'Are you a PwD / PwBD candidate?',
      value: 'No',
      source: null,
      locked: false,
    },

    {
      key: 'disabilityType',
      label: 'Disability Type',
      value: '',
      source: null,
      locked: false,
    },

    {
      key: 'disabilityPercentage',
      label: 'Disability Percentage',
      value: '',
      source: null,
      locked: false,
    },

    {
      key: 'udidNumber',
      label: 'UDID Number',
      value: '',
      source: null,
      locked: false,
    },
  ],


  // ----------------------------------------------------------
  // 3. PARENT / GUARDIAN DETAILS
  // ----------------------------------------------------------

  parent: [
    {
      key: 'fatherOccupation',
      label: "Father's / Guardian's Occupation",
      value: '',
      source: null,
      locked: false,
    },

    {
      key: 'fatherQualification',
      label: "Father's / Guardian's Qualification",
      value: '',
      source: null,
      locked: false,
    },

    {
      key: 'motherOccupation',
      label: "Mother's / Guardian's Occupation",
      value: '',
      source: null,
      locked: false,
    },

    {
      key: 'motherQualification',
      label: "Mother's / Guardian's Qualification",
      value: '',
      source: null,
      locked: false,
    },
  ],


  // ----------------------------------------------------------
  // 4. EXAMINATION DETAILS
  // ----------------------------------------------------------

  examination: [
    {
      key: 'paper',
      label: 'Paper Applied For',
      value: 'Paper 1 (B.E./B.Tech.)',
      source: null,
      locked: false,
    },

    {
      key: 'questionPaperMedium',
      label: 'Question Paper Medium',
      value: 'English',
      source: null,
      locked: false,
    },

    {
      key: 'session',
      label: 'Session',
      value: 'Session 2',
      source: null,
      locked: false,
    },

    {
      key: 'stateOfEligibility',
      label: 'State of Eligibility',
      value: 'Uttar Pradesh',
      source: null,
      locked: false,
    },

    {
      key: 'examCity1',
      label: 'Exam City Choice 1',
      value: 'Lucknow',
      source: null,
      locked: false,
    },

    {
      key: 'examCity2',
      label: 'Exam City Choice 2',
      value: 'Ghaziabad',
      source: null,
      locked: false,
    },

    {
      key: 'examCity3',
      label: 'Exam City Choice 3',
      value: '',
      source: null,
      locked: false,
    },

    {
      key: 'examCity4',
      label: 'Exam City Choice 4',
      value: '',
      source: null,
      locked: false,
    },
  ],


  // ----------------------------------------------------------
  // 5. CLASS 10 EDUCATION
  // ----------------------------------------------------------

  education10: [
    {
      key: 'class10Status',
      label: 'Class 10 Status',
      value: 'Passed',
      source: '10th Marksheet',
      locked: true,
    },

    {
      key: 'class10Board',
      label: 'Class 10 Board',
      value: '',
      source: null,
      locked: false,
    },

    {
      key: 'class10PassingYear',
      label: 'Class 10 Passing Year',
      value: '',
      source: null,
      locked: false,
    },

    {
      key: 'class10School',
      label: 'Class 10 School',
      value: '',
      source: null,
      locked: false,
    },

    {
      key: 'class10SchoolType',
      label: 'Class 10 School Type',
      value: '',
      source: null,
      locked: false,
    },

    {
      key: 'class10State',
      label: 'Class 10 State',
      value: '',
      source: null,
      locked: false,
    },

    {
      key: 'class10District',
      label: 'Class 10 District',
      value: '',
      source: null,
      locked: false,
    },

    {
      key: 'class10RollNumber',
      label: 'Class 10 Roll Number',
      value: '',
      source: null,
      locked: false,
    },

    {
      key: 'class10Marks',
      label: 'Class 10 Marks / Percentage',
      value: '94.2%',
      source: '10th Marksheet',
      locked: true,
    },
  ],


  // ----------------------------------------------------------
  // 6. CLASS 12 EDUCATION
  // ----------------------------------------------------------

  education12: [
    {
      key: 'class12Status',
      label: 'Class 12 Status',
      value: 'Appearing',
      source: null,
      locked: false,
    },

    {
      key: 'class12Board',
      label: 'Class 12 Board',
      value: '',
      source: null,
      locked: false,
    },

    {
      key: 'class12PassingYear',
      label: 'Class 12 Passing / Appearing Year',
      value: '',
      source: null,
      locked: false,
    },

    {
      key: 'class12School',
      label: 'Class 12 School',
      value: '',
      source: null,
      locked: false,
    },

    {
      key: 'class12SchoolType',
      label: 'Class 12 School Type',
      value: '',
      source: null,
      locked: false,
    },

    {
      key: 'class12State',
      label: 'Class 12 State',
      value: '',
      source: null,
      locked: false,
    },

    {
      key: 'class12District',
      label: 'Class 12 District',
      value: '',
      source: null,
      locked: false,
    },

    {
      key: 'class12RollNumber',
      label: 'Class 12 Roll / Registration Number',
      value: '',
      source: null,
      locked: false,
    },

    {
      key: 'class12Marks',
      label: 'Class 12 Marks / Percentage',
      value: '',
      source: null,
      locked: false,
    },
  ],


  // ----------------------------------------------------------
  // 7. PRESENT ADDRESS + CONTACT
  // ----------------------------------------------------------

  address: [
    {
      key: 'address',
      label: 'Address',
      value:
        '221, Sector 12, Vasundhara, Ghaziabad, Uttar Pradesh — 201012',
      source: 'Aadhaar Card',
      locked: true,
    },

    {
      key: 'city',
      label: 'City / Town / Village',
      value: 'Ghaziabad',
      source: null,
      locked: false,
    },

    {
      key: 'district',
      label: 'District',
      value: 'Ghaziabad',
      source: null,
      locked: false,
    },

    {
      key: 'state',
      label: 'State',
      value: 'Uttar Pradesh',
      source: null,
      locked: false,
    },

    {
      key: 'country',
      label: 'Country',
      value: 'India',
      source: null,
      locked: false,
    },

    {
      key: 'pinCode',
      label: 'PIN Code',
      value: '201012',
      source: null,
      locked: false,
    },

    {
      key: 'mobile',
      label: 'Mobile Number',
      value: '+91 98XXXXXX21',
      source: null,
      locked: false,
    },

    {
      key: 'email',
      label: 'Email Address',
      value: 'ishaan.verma@gmail.com',
      source: 'Account',
      locked: true,
    },

    {
      key: 'alternateContact',
      label: 'Alternate Contact Number',
      value: '',
      source: null,
      locked: false,
    },
  ],


  // ----------------------------------------------------------
  // 8. ADDITIONAL DETAILS
  // ----------------------------------------------------------

  additional: [
    {
      key: 'twin',
      label: 'Are you a twin / applying with a twin?',
      value: 'No',
      source: null,
      locked: false,
    },

    {
      key: 'placeOfBirthAdditional',
      label: 'Place of Birth',
      value: '',
      source: null,
      locked: false,
    },

    {
      key: 'otherDeclaration',
      label: 'Other Applicable Declaration',
      value: '',
      source: null,
      locked: false,
    },
  ],


  // ----------------------------------------------------------
  // BACKWARD COMPATIBILITY
  // ----------------------------------------------------------
  // Existing components may still use these arrays.
  // Keep them so the old UI doesn't immediately break.

  locked: [
    {
      label: 'Full Name',
      value: 'Ishaan Verma',
      source: 'Aadhaar Card',
    },

    {
      label: 'Date of Birth',
      value: '14 Mar 2009',
      source: 'Aadhaar Card',
    },

    {
      label: "Father's Name",
      value: 'Rakesh Verma',
      source: '10th Marksheet',
    },

    {
      label: 'Gender',
      value: 'Male',
      source: 'Aadhaar Card',
    },
  ],

  editable: [
    {
      label: 'Address',
      value:
        '221, Sector 12, Vasundhara, Ghaziabad, Uttar Pradesh — 201012',
    },

    {
      label: 'Mobile Number',
      value: '+91 98XXXXXX21',
    },

    {
      label: 'Category',
      value: 'General',
    },

    {
      label: 'Preferred Exam City 1',
      value: 'Lucknow',
    },

    {
      label: 'Preferred Exam City 2',
      value: 'Ghaziabad',
    },
  ],
}


// ============================================================
// APPLICANT APPLICATIONS
// ============================================================

export const applicantApplications = [
  {
    id: 'APP-10432',
    form: 'JEE Main',
    status: 'Processing',
    operator: 'Priya Sharma',
    updated: '2 hours ago',
  },
]


// ============================================================
// APPLICATION TIMELINE
// ============================================================

export const applicationTimeline = [
  {
    id: 1,
    label: 'Application received',
    done: true,
    time: '10:02 AM',
  },

  {
    id: 2,
    label: 'Payment confirmed',
    done: true,
    time: '10:03 AM',
  },

  {
    id: 3,
    label: 'Operator assigned',
    done: true,
    time: '10:14 AM',
  },

  {
    id: 4,
    label: 'Application processing',
    done: false,
    time: 'In progress',
  },

  {
    id: 5,
    label: 'Final review pending',
    done: false,
    time: '',
  },

  {
    id: 6,
    label: 'Submission',
    done: false,
    time: '',
  },
]


// ============================================================
// CHAT
// ============================================================

export const initialChatMessages = [
  {
    id: 1,
    from: 'system',
    text: 'Operator assigned: Priya Sharma',
    time: '10:14 AM',
  },

  {
    id: 2,
    from: 'operator',
    text:
      'Hi Ishaan, I’ll be handling your JEE Main application today. Give me a few minutes to get started.',
    time: '10:15 AM',
  },
]


// ============================================================
// APPLICANT NOTIFICATIONS
// ============================================================

export const applicantNotifications = [
  {
    id: 1,
    text:
      'Priya Sharma sent your JEE Main application for review.',
    time: '5 minutes ago',
    unread: true,
    tag: 'Action needed',
    tone: 'blue',
  },

  {
    id: 2,
    text:
      'Payment of ₹1,249 for JEE Main confirmed.',
    time: '2 hours ago',
    unread: true,
    tag: 'Payment',
    tone: 'green',
  },

  {
    id: 3,
    text:
      'An operator has been assigned to your application.',
    time: '2 hours ago',
    unread: false,
  },

  {
    id: 4,
    text:
      'Your Class 10 Marksheet finished processing and is ready.',
    time: 'Yesterday',
    unread: false,
  },
]


// ============================================================
// OPERATOR SIDE
// ============================================================


// ------------------------------------------------------------
// OPERATOR PROFILE
// ------------------------------------------------------------

export const operatorProfile = {
  name: 'Priya Sharma',
  email: 'priya.sharma@formfiller.in',
  avatarInitials: 'PS',
}


// ------------------------------------------------------------
// OPERATOR QUEUE
// ------------------------------------------------------------

export const operatorQueue = [
  {
    id: 'APP-10432',
    applicant: 'Ishaan Verma',
    form: 'JEE Main',
    assignedAt: '10:14 AM',
    status: 'In progress',
  },

  {
    id: 'APP-10441',
    applicant: 'Neha Kulkarni',
    form: 'JEE Main',
    assignedAt: '11:02 AM',
    status: 'Waiting',
  },

  {
    id: 'APP-10438',
    applicant: 'Aditya Rao',
    form: 'JEE Main',
    assignedAt: '9:41 AM',
    status: 'Waiting',
  },
]


// ------------------------------------------------------------
// OPERATOR STATS
// ------------------------------------------------------------

export const operatorStats = {
  completedToday: 6,
  avgTime: '11m',
  activeSince: '9:00 AM',
}


// ------------------------------------------------------------
// OPERATOR NOTIFICATIONS
// ------------------------------------------------------------

export const operatorNotifications = [
  {
    id: 1,
    text:
      'New JEE Main application assigned — Neha Kulkarni (APP-10441).',
    time: '12 minutes ago',
    unread: true,
    tag: 'New',
    tone: 'blue',
  },

  {
    id: 2,
    text:
      'Ishaan Verma replied in chat for APP-10432.',
    time: '20 minutes ago',
    unread: true,
  },

  {
    id: 3,
    text:
      'Aditya Rao’s application has been waiting for 40 minutes.',
    time: '40 minutes ago',
    unread: false,
    tag: 'Reminder',
    tone: 'amber',
  },
]


// ------------------------------------------------------------
// APPLICANT DATA PANEL
// ------------------------------------------------------------

export const applicantDataPanel = {
  name: 'Ishaan Verma',
  dob: '14/03/2009',
  father: 'Rakesh Verma',
  mother: '',
  gender: 'Male',
  nationality: 'Indian',
  aadhaar: 'XXXX XXXX 4821',

  address:
    '221, Sector 12, Vasundhara, Ghaziabad, Uttar Pradesh — 201012',

  category: 'General',

  school: 'Delhi Public School, Ghaziabad',

  marks10: '94.2%',
  marks12: '',

  city1: 'Lucknow',
  city2: 'Ghaziabad',
  city3: '',
  city4: '',

  pwbd: 'No',
}


// ============================================================
// ADMIN SIDE
// ============================================================


// ------------------------------------------------------------
// ADMIN KPIs
// ------------------------------------------------------------

export const adminKpis = {
  totalApplicants: 4820,
  totalApplications: 5931,
  activeOperators: 18,
  completedApplications: 4102,
}


// ------------------------------------------------------------
// ADMIN APPLICATIONS
// ------------------------------------------------------------

export const adminApplications = [
  {
    id: 'APP-10432',
    applicant: 'Ishaan Verma',
    form: 'JEE Main',
    operator: 'Priya Sharma',
    status: 'Processing',
    payment: 'Paid',
    created: '24 Sep',
    updated: '2h ago',
  },

  {
    id: 'APP-10441',
    applicant: 'Neha Kulkarni',
    form: 'JEE Main',
    operator: 'Priya Sharma',
    status: 'Assigned',
    payment: 'Paid',
    created: '24 Sep',
    updated: '35m ago',
  },

  {
    id: 'APP-10438',
    applicant: 'Aditya Rao',
    form: 'JEE Main',
    operator: 'Rohit Nair',
    status: 'Under Review',
    payment: 'Paid',
    created: '23 Sep',
    updated: '1h ago',
  },

  {
    id: 'APP-10429',
    applicant: 'Sneha Iyer',
    form: 'JEE Main',
    operator: 'Rohit Nair',
    status: 'Correction Required',
    payment: 'Paid',
    created: '23 Sep',
    updated: '4h ago',
  },

  {
    id: 'APP-10417',
    applicant: 'Kabir Singh',
    form: 'JEE Main',
    operator: '—',
    status: 'New',
    payment: 'Pending',
    created: '23 Sep',
    updated: '5h ago',
  },

  {
    id: 'APP-10390',
    applicant: 'Ananya Das',
    form: 'JEE Main',
    operator: 'Priya Sharma',
    status: 'Submitted',
    payment: 'Paid',
    created: '21 Sep',
    updated: '1d ago',
  },

  {
    id: 'APP-10382',
    applicant: 'Vivaan Mehta',
    form: 'JEE Main',
    operator: 'Rohit Nair',
    status: 'Completed',
    payment: 'Paid',
    created: '20 Sep',
    updated: '2d ago',
  },
]


// ------------------------------------------------------------
// ADMIN APPLICANTS
// ------------------------------------------------------------

export const adminApplicants = [
  {
    id: 'USR-2291',
    name: 'Ishaan Verma',
    applications: 1,
    latestForm: 'JEE Main',
    status: 'Active',
    joined: '3 Sep 2026',
  },

  {
    id: 'USR-2290',
    name: 'Neha Kulkarni',
    applications: 1,
    latestForm: 'JEE Main',
    status: 'Active',
    joined: '3 Sep 2026',
  },

  {
    id: 'USR-2265',
    name: 'Aditya Rao',
    applications: 2,
    latestForm: 'JEE Main',
    status: 'Active',
    joined: '18 Aug 2026',
  },

  {
    id: 'USR-2201',
    name: 'Sneha Iyer',
    applications: 1,
    latestForm: 'JEE Main',
    status: 'Needs attention',
    joined: '2 Aug 2026',
  },

  {
    id: 'USR-2180',
    name: 'Kabir Singh',
    applications: 1,
    latestForm: 'JEE Main',
    status: 'Payment pending',
    joined: '30 Jul 2026',
  },
]


// ------------------------------------------------------------
// ADMIN OPERATORS
// ------------------------------------------------------------

export const adminOperators = [
  {
    id: 'OPR-04',
    name: 'Priya Sharma',
    status: 'Active',
    current: 'APP-10432',
    today: 7,
    completed: 189,
    lastActive: 'now',
  },

  {
    id: 'OPR-07',
    name: 'Rohit Nair',
    status: 'Busy',
    current: 'APP-10438',
    today: 5,
    completed: 231,
    lastActive: '2m ago',
  },

  {
    id: 'OPR-11',
    name: 'Kavya Menon',
    status: 'Inactive',
    current: '—',
    today: 0,
    completed: 142,
    lastActive: '3h ago',
  },

  {
    id: 'OPR-02',
    name: 'Arjun Desai',
    status: 'Active',
    current: '—',
    today: 4,
    completed: 302,
    lastActive: '6m ago',
  },
]


// ------------------------------------------------------------
// ADMIN PAYMENTS
// ------------------------------------------------------------

export const adminPayments = [
  {
    id: 'PAY-88213',
    application: 'APP-10432',
    applicant: 'Ishaan Verma',
    amount: '₹1,249',
    status: 'Paid',
    method: 'UPI',
    date: '24 Sep',
  },

  {
    id: 'PAY-88214',
    application: 'APP-10441',
    applicant: 'Neha Kulkarni',
    amount: '₹1,249',
    status: 'Paid',
    method: 'Card',
    date: '24 Sep',
  },

  {
    id: 'PAY-88190',
    application: 'APP-10417',
    applicant: 'Kabir Singh',
    amount: '₹1,249',
    status: 'Pending',
    method: '—',
    date: '23 Sep',
  },

  {
    id: 'PAY-88144',
    application: 'APP-10382',
    applicant: 'Vivaan Mehta',
    amount: '₹1,249',
    status: 'Refunded',
    method: 'UPI',
    date: '20 Sep',
  },

  {
    id: 'PAY-88098',
    application: 'APP-10370',
    applicant: 'Riya Kapoor',
    amount: '₹1,249',
    status: 'Failed',
    method: 'Card',
    date: '19 Sep',
  },
]


// ------------------------------------------------------------
// ADMIN NOTIFICATIONS
// ------------------------------------------------------------

export const adminNotifications = [
  {
    id: 1,
    text:
      'Payment failed for PAY-88098 (Riya Kapoor).',
    time: '18 minutes ago',
    unread: true,
    tag: 'Failed',
    tone: 'red',
  },

  {
    id: 2,
    text:
      'Sneha Iyer’s application needs a correction from her operator.',
    time: '4 hours ago',
    unread: true,
    tag: 'Attention',
    tone: 'amber',
  },

  {
    id: 3,
    text:
      'Operator Kavya Menon has been inactive for 3 hours.',
    time: '3 hours ago',
    unread: false,
  },
]


// ------------------------------------------------------------
// ADMIN ACTIVITY LOG
// ------------------------------------------------------------

export const adminActivityLog = [
  {
    time: '11:42 AM',
    actor: 'Ishaan Verma',
    role: 'Applicant',
    action: 'Approved final application',
    application: 'APP-10432',
    status: 'Approved',
  },

  {
    time: '11:20 AM',
    actor: 'Priya Sharma',
    role: 'Operator',
    action: 'Sent application for review',
    application: 'APP-10432',
    status: 'Under Review',
  },

  {
    time: '10:58 AM',
    actor: 'System',
    role: 'System',
    action: 'Document processing completed',
    application: 'APP-10441',
    status: 'Ready',
  },

  {
    time: '10:14 AM',
    actor: 'System',
    role: 'System',
    action: 'Operator assigned',
    application: 'APP-10432',
    status: 'Assigned',
  },

  {
    time: '10:03 AM',
    actor: 'System',
    role: 'System',
    action: 'Payment successful',
    application: 'APP-10432',
    status: 'Paid',
  },

  {
    time: '9:41 AM',
    actor: 'Aditya Rao',
    role: 'Applicant',
    action: 'Submitted correction request',
    application: 'APP-10438',
    status: 'Correction Required',
  },
]