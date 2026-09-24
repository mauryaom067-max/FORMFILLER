// All data below is illustrative mock data for prototyping only.

export const applicant = {
  name: 'Ishaan Verma',
  email: 'ishaan.verma@gmail.com',
  phone: '**** ** 4821',
  joined: '3 Sep 2026',
  avatarInitials: 'IV',
}

export const jeeMainForm = {
  id: 'jee-main',
  name: 'JEE Main',
  fullName: 'Joint Entrance Examination — Main',
  session: 'Session 2, 2027',
  fee: 1000,
  serviceFee: 249,
  documents: [
    { key: 'aadhaar', label: 'Aadhaar Card', hint: 'Used to verify identity details', inVault: true },
    { key: 'photo', label: 'Applicant Photograph', hint: 'Recent passport-style photo, plain background', inVault: true },
    { key: 'signature', label: 'Signature', hint: 'Signature on white paper, scanned or photographed', inVault: false },
    { key: 'marksheet', label: '10th Marksheet', hint: 'Used to auto-fill academic details', inVault: true },
  ],
}

export const vaultDocuments = [
  { id: 'doc_aadhaar', label: 'Aadhaar Card', type: 'Identity', addedOn: '12 Jan 2026', size: '412 KB', masked: 'XXXX XXXX 4821' },
  { id: 'doc_photo', label: 'Applicant Photograph', type: 'Photo', addedOn: '12 Jan 2026', size: '186 KB' },
  { id: 'doc_marksheet', label: '10th Marksheet', type: 'Academic', addedOn: '15 Jan 2026', size: '1.1 MB' },
  { id: 'doc_signature_old', label: 'Signature (2024)', type: 'Signature', addedOn: '3 Feb 2024', size: '58 KB' },
]

export const extractedFields = {
  locked: [
    { label: 'Full Name', value: 'Ishaan Verma', source: 'Aadhaar Card' },
    { label: 'Date of Birth', value: '14 Mar 2009', source: 'Aadhaar Card' },
    { label: "Father's Name", value: 'Rakesh Verma', source: '10th Marksheet' },
    { label: 'Gender', value: 'Male', source: 'Aadhaar Card' },
  ],
  editable: [
    { label: 'Address', value: '221, Sector 12, Vasundhara, Ghaziabad, Uttar Pradesh — 201012' },
    { label: 'Mobile Number', value: '+91 98XXXXXX21' },
    { label: 'Category', value: 'General' },
    { label: 'Preferred Exam City 1', value: 'Lucknow' },
    { label: 'Preferred Exam City 2', value: 'Ghaziabad' },
  ],
}

export const applicantApplications = [
  {
    id: 'APP-10432',
    form: 'JEE Main',
    status: 'Processing',
    operator: 'Priya Sharma',
    updated: '2 hours ago',
  },
]

export const applicationTimeline = [
  { id: 1, label: 'Application received', done: true, time: '10:02 AM' },
  { id: 2, label: 'Payment confirmed', done: true, time: '10:03 AM' },
  { id: 3, label: 'Operator assigned', done: true, time: '10:14 AM' },
  { id: 4, label: 'Application processing', done: false, time: 'In progress' },
  { id: 5, label: 'Final review pending', done: false, time: '' },
  { id: 6, label: 'Submission', done: false, time: '' },
]

export const initialChatMessages = [
  { id: 1, from: 'system', text: 'Operator assigned: Priya Sharma', time: '10:14 AM' },
  { id: 2, from: 'operator', text: 'Hi Ishaan, I\u2019ll be handling your JEE Main application today. Give me a few minutes to get started.', time: '10:15 AM' },
]

export const applicantNotifications = [
  { id: 1, text: 'Priya Sharma sent your JEE Main application for review.', time: '5 minutes ago', unread: true, tag: 'Action needed', tone: 'blue' },
  { id: 2, text: 'Payment of \u20b91,249 for JEE Main confirmed.', time: '2 hours ago', unread: true, tag: 'Payment', tone: 'green' },
  { id: 3, text: 'An operator has been assigned to your application.', time: '2 hours ago', unread: false },
  { id: 4, text: 'Your 10th Marksheet finished processing and is ready.', time: 'Yesterday', unread: false },
]

// ---------------- Operator side ----------------

export const operatorProfile = { name: 'Priya Sharma', email: 'priya.sharma@formfiller.in', avatarInitials: 'PS' }

export const operatorQueue = [
  { id: 'APP-10432', applicant: 'Ishaan Verma', form: 'JEE Main', assignedAt: '10:14 AM', status: 'In progress' },
  { id: 'APP-10441', applicant: 'Neha Kulkarni', form: 'JEE Main', assignedAt: '11:02 AM', status: 'Waiting' },
  { id: 'APP-10438', applicant: 'Aditya Rao', form: 'JEE Main', assignedAt: '9:41 AM', status: 'Waiting' },
]

export const operatorStats = { completedToday: 6, avgTime: '11m', activeSince: '9:00 AM' }

export const operatorNotifications = [
  { id: 1, text: 'New JEE Main application assigned \u2014 Neha Kulkarni (APP-10441).', time: '12 minutes ago', unread: true, tag: 'New', tone: 'blue' },
  { id: 2, text: 'Ishaan Verma replied in chat for APP-10432.', time: '20 minutes ago', unread: true },
  { id: 3, text: 'Aditya Rao\u2019s application has been waiting for 40 minutes.', time: '40 minutes ago', unread: false, tag: 'Reminder', tone: 'amber' },
]

export const applicantDataPanel = {
  name: 'Ishaan Verma',
  dob: '14/03/2009',
  father: 'Rakesh Verma',
  gender: 'Male',
  aadhaar: 'XXXX XXXX 4821',
  address: '221, Sector 12, Vasundhara, Ghaziabad, Uttar Pradesh \u2014 201012',
  category: 'General',
  school: 'Delhi Public School, Ghaziabad',
  marks10: '94.2%',
  city1: 'Lucknow',
  city2: 'Ghaziabad',
}

// ---------------- Admin side ----------------

export const adminKpis = {
  totalApplicants: 4820,
  totalApplications: 5931,
  activeOperators: 18,
  completedApplications: 4102,
}

export const adminApplications = [
  { id: 'APP-10432', applicant: 'Ishaan Verma', form: 'JEE Main', operator: 'Priya Sharma', status: 'Processing', payment: 'Paid', created: '24 Sep', updated: '2h ago' },
  { id: 'APP-10441', applicant: 'Neha Kulkarni', form: 'JEE Main', operator: 'Priya Sharma', status: 'Assigned', payment: 'Paid', created: '24 Sep', updated: '35m ago' },
  { id: 'APP-10438', applicant: 'Aditya Rao', form: 'JEE Main', operator: 'Rohit Nair', status: 'Under Review', payment: 'Paid', created: '23 Sep', updated: '1h ago' },
  { id: 'APP-10429', applicant: 'Sneha Iyer', form: 'JEE Main', operator: 'Rohit Nair', status: 'Correction Required', payment: 'Paid', created: '23 Sep', updated: '4h ago' },
  { id: 'APP-10417', applicant: 'Kabir Singh', form: 'JEE Main', operator: '\u2014', status: 'New', payment: 'Pending', created: '23 Sep', updated: '5h ago' },
  { id: 'APP-10390', applicant: 'Ananya Das', form: 'JEE Main', operator: 'Priya Sharma', status: 'Submitted', payment: 'Paid', created: '21 Sep', updated: '1d ago' },
  { id: 'APP-10382', applicant: 'Vivaan Mehta', form: 'JEE Main', operator: 'Rohit Nair', status: 'Completed', payment: 'Paid', created: '20 Sep', updated: '2d ago' },
]

export const adminApplicants = [
  { id: 'USR-2291', name: 'Ishaan Verma', applications: 1, latestForm: 'JEE Main', status: 'Active', joined: '3 Sep 2026' },
  { id: 'USR-2290', name: 'Neha Kulkarni', applications: 1, latestForm: 'JEE Main', status: 'Active', joined: '3 Sep 2026' },
  { id: 'USR-2265', name: 'Aditya Rao', applications: 2, latestForm: 'JEE Main', status: 'Active', joined: '18 Aug 2026' },
  { id: 'USR-2201', name: 'Sneha Iyer', applications: 1, latestForm: 'JEE Main', status: 'Needs attention', joined: '2 Aug 2026' },
  { id: 'USR-2180', name: 'Kabir Singh', applications: 1, latestForm: 'JEE Main', status: 'Payment pending', joined: '30 Jul 2026' },
]

export const adminOperators = [
  { id: 'OPR-04', name: 'Priya Sharma', status: 'Active', current: 'APP-10432', today: 7, completed: 189, lastActive: 'now' },
  { id: 'OPR-07', name: 'Rohit Nair', status: 'Busy', current: 'APP-10438', today: 5, completed: 231, lastActive: '2m ago' },
  { id: 'OPR-11', name: 'Kavya Menon', status: 'Inactive', current: '\u2014', today: 0, completed: 142, lastActive: '3h ago' },
  { id: 'OPR-02', name: 'Arjun Desai', status: 'Active', current: '\u2014', today: 4, completed: 302, lastActive: '6m ago' },
]

export const adminPayments = [
  { id: 'PAY-88213', application: 'APP-10432', applicant: 'Ishaan Verma', amount: '\u20b91,249', status: 'Paid', method: 'UPI', date: '24 Sep' },
  { id: 'PAY-88214', application: 'APP-10441', applicant: 'Neha Kulkarni', amount: '\u20b91,249', status: 'Paid', method: 'Card', date: '24 Sep' },
  { id: 'PAY-88190', application: 'APP-10417', applicant: 'Kabir Singh', amount: '\u20b91,249', status: 'Pending', method: '\u2014', date: '23 Sep' },
  { id: 'PAY-88144', application: 'APP-10382', applicant: 'Vivaan Mehta', amount: '\u20b91,249', status: 'Refunded', method: 'UPI', date: '20 Sep' },
  { id: 'PAY-88098', application: 'APP-10370', applicant: 'Riya Kapoor', amount: '\u20b91,249', status: 'Failed', method: 'Card', date: '19 Sep' },
]

export const adminNotifications = [
  { id: 1, text: 'Payment failed for PAY-88098 (Riya Kapoor).', time: '18 minutes ago', unread: true, tag: 'Failed', tone: 'red' },
  { id: 2, text: 'Sneha Iyer\u2019s application needs a correction from her operator.', time: '4 hours ago', unread: true, tag: 'Attention', tone: 'amber' },
  { id: 3, text: 'Operator Kavya Menon has been inactive for 3 hours.', time: '3 hours ago', unread: false },
]

export const adminActivityLog = [
  { time: '11:42 AM', actor: 'Ishaan Verma', role: 'Applicant', action: 'Approved final application', application: 'APP-10432', status: 'Approved' },
  { time: '11:20 AM', actor: 'Priya Sharma', role: 'Operator', action: 'Sent application for review', application: 'APP-10432', status: 'Under Review' },
  { time: '10:58 AM', actor: 'System', role: 'System', action: 'Document processing completed', application: 'APP-10441', status: 'Ready' },
  { time: '10:14 AM', actor: 'System', role: 'System', action: 'Operator assigned', application: 'APP-10432', status: 'Assigned' },
  { time: '10:03 AM', actor: 'System', role: 'System', action: 'Payment successful', application: 'APP-10432', status: 'Paid' },
  { time: '9:41 AM', actor: 'Aditya Rao', role: 'Applicant', action: 'Submitted correction request', application: 'APP-10438', status: 'Correction Required' },
]
