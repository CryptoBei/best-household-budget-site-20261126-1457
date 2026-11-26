// Seed data for Hearthledger: one household's November 2026, with real-looking figures.
// The household is Alex and Priya with one child, Maya. "Today" in the seed is
// 26 November 2026, so pace notes ("4 days left in the month") are stable.
// Everything the site shows is computed from these records by store.js; adding a
// transaction, editing a budget or paying a bill changes every total on every page.

export const TODAY = '2026-11-26';
export const MONTH_LABEL = 'November 2026';
export const DAYS_IN_MONTH = 30;
export const DAY_OF_MONTH = 26;

export const HOUSEHOLD = {
  name: 'The Alvarez household',
  members: ['Alex', 'Priya', 'Maya'],
  accounts: ['Everyday Checking', 'Joint Savings', 'Credit Card', 'Cash'],
};

// group: 'needs' | 'wants' — used by the 50/30/20 check on the Budget page.
export const CATEGORIES = [
  { name: 'Housing', group: 'needs', color: '#0f766e', planned: 1950 },
  { name: 'Groceries', group: 'needs', color: '#65a30d', planned: 850 },
  { name: 'Dining Out', group: 'wants', color: '#d97706', planned: 320 },
  { name: 'Transport', group: 'needs', color: '#2563eb', planned: 420 },
  { name: 'Utilities', group: 'needs', color: '#0891b2', planned: 420 },
  { name: 'Health', group: 'needs', color: '#db2777', planned: 220 },
  { name: 'Kids & School', group: 'needs', color: '#7c3aed', planned: 420 },
  { name: 'Entertainment', group: 'wants', color: '#ea580c', planned: 150 },
  { name: 'Shopping', group: 'wants', color: '#b45309', planned: 300 },
  { name: 'Subscriptions', group: 'wants', color: '#475569', planned: 60 },
];

// type: 'income' | 'expense'. Amounts are always positive; the type carries the sign.
export const TRANSACTIONS = [
  { id: 't01', date: '2026-11-01', description: 'Rent — Maple Street apartment', category: 'Housing', type: 'expense', amount: 1850, account: 'Everyday Checking', member: 'Household' },
  { id: 't02', date: '2026-11-02', description: 'Weekly groceries — FreshMart', category: 'Groceries', type: 'expense', amount: 186.42, account: 'Credit Card', member: 'Priya' },
  { id: 't03', date: '2026-11-03', description: 'Salary — Alex (first half)', category: 'Income', type: 'income', amount: 2125, account: 'Everyday Checking', member: 'Alex' },
  { id: 't04', date: '2026-11-03', description: 'Electricity bill', category: 'Utilities', type: 'expense', amount: 142.18, account: 'Everyday Checking', member: 'Household' },
  { id: 't05', date: '2026-11-04', description: 'Metro passes ×2', category: 'Transport', type: 'expense', amount: 110, account: 'Credit Card', member: 'Household' },
  { id: 't06', date: '2026-11-05', description: 'Salary — Priya (first half)', category: 'Income', type: 'income', amount: 1650, account: 'Everyday Checking', member: 'Priya' },
  { id: 't07', date: '2026-11-05', description: 'Pharmacy — cold medicine', category: 'Health', type: 'expense', amount: 38.6, account: 'Cash', member: 'Priya' },
  { id: 't08', date: '2026-11-06', description: 'School supplies for Maya', category: 'Kids & School', type: 'expense', amount: 54.25, account: 'Credit Card', member: 'Priya' },
  { id: 't09', date: '2026-11-07', description: 'Coffee and lunch out', category: 'Dining Out', type: 'expense', amount: 42.8, account: 'Credit Card', member: 'Alex' },
  { id: 't10', date: '2026-11-08', description: 'Weekly groceries — FreshMart', category: 'Groceries', type: 'expense', amount: 174.9, account: 'Credit Card', member: 'Alex' },
  { id: 't11', date: '2026-11-09', description: 'Internet bill', category: 'Utilities', type: 'expense', amount: 79, account: 'Everyday Checking', member: 'Household' },
  { id: 't12', date: '2026-11-09', description: 'Childcare top-up', category: 'Kids & School', type: 'expense', amount: 240, account: 'Everyday Checking', member: 'Household' },
  { id: 't13', date: '2026-11-10', description: 'New running shoes', category: 'Shopping', type: 'expense', amount: 119.99, account: 'Credit Card', member: 'Alex' },
  { id: 't14', date: '2026-11-10', description: 'Music app subscription', category: 'Subscriptions', type: 'expense', amount: 11.99, account: 'Credit Card', member: 'Priya' },
  { id: 't15', date: '2026-11-11', description: 'Gym membership', category: 'Health', type: 'expense', amount: 45, account: 'Everyday Checking', member: 'Alex' },
  { id: 't16', date: '2026-11-12', description: 'Freelance design payment', category: 'Income', type: 'income', amount: 480, account: 'Everyday Checking', member: 'Priya' },
  { id: 't17', date: '2026-11-12', description: 'Takeaway pizza night', category: 'Dining Out', type: 'expense', amount: 58.4, account: 'Credit Card', member: 'Household' },
  { id: 't18', date: '2026-11-13', description: 'Fuel', category: 'Transport', type: 'expense', amount: 52.3, account: 'Credit Card', member: 'Alex' },
  { id: 't19', date: '2026-11-14', description: 'Streaming bundle', category: 'Subscriptions', type: 'expense', amount: 27.98, account: 'Credit Card', member: 'Household' },
  { id: 't20', date: '2026-11-15', description: 'Weekly groceries — market and FreshMart', category: 'Groceries', type: 'expense', amount: 201.17, account: 'Credit Card', member: 'Priya' },
  { id: 't21', date: '2026-11-15', description: 'Cloud storage plan', category: 'Subscriptions', type: 'expense', amount: 9.99, account: 'Credit Card', member: 'Alex' },
  { id: 't22', date: '2026-11-16', description: 'Water bill', category: 'Utilities', type: 'expense', amount: 64.22, account: 'Everyday Checking', member: 'Household' },
  { id: 't23', date: '2026-11-17', description: 'Salary — Alex (second half)', category: 'Income', type: 'income', amount: 2125, account: 'Everyday Checking', member: 'Alex' },
  { id: 't24', date: '2026-11-17', description: 'Dentist copay', category: 'Health', type: 'expense', amount: 85, account: 'Credit Card', member: 'Priya' },
  { id: 't25', date: '2026-11-18', description: 'Maya’s football club fees', category: 'Kids & School', type: 'expense', amount: 75, account: 'Everyday Checking', member: 'Household' },
  { id: 't26', date: '2026-11-18', description: 'Cinema tickets ×3', category: 'Entertainment', type: 'expense', amount: 42, account: 'Credit Card', member: 'Household' },
  { id: 't27', date: '2026-11-19', description: 'Salary — Priya (second half)', category: 'Income', type: 'income', amount: 1650, account: 'Everyday Checking', member: 'Priya' },
  { id: 't28', date: '2026-11-19', description: 'Dinner with friends', category: 'Dining Out', type: 'expense', amount: 96.5, account: 'Credit Card', member: 'Alex' },
  { id: 't29', date: '2026-11-20', description: 'Savings account interest', category: 'Income', type: 'income', amount: 12.4, account: 'Joint Savings', member: 'Household' },
  { id: 't30', date: '2026-11-20', description: 'Car insurance (monthly)', category: 'Transport', type: 'expense', amount: 148, account: 'Everyday Checking', member: 'Household' },
  { id: 't31', date: '2026-11-21', description: 'Weekly groceries — FreshMart', category: 'Groceries', type: 'expense', amount: 168.35, account: 'Credit Card', member: 'Alex' },
  { id: 't32', date: '2026-11-22', description: 'Bookshop — two paperbacks', category: 'Entertainment', type: 'expense', amount: 34.5, account: 'Cash', member: 'Priya' },
  { id: 't33', date: '2026-11-22', description: 'Hardware store — shelf brackets and paint', category: 'Housing', type: 'expense', amount: 63.45, account: 'Credit Card', member: 'Alex' },
  { id: 't34', date: '2026-11-23', description: 'Winter coat and boots for Maya', category: 'Shopping', type: 'expense', amount: 142.6, account: 'Credit Card', member: 'Priya' },
  { id: 't35', date: '2026-11-24', description: 'Phone bill (paid early)', category: 'Utilities', type: 'expense', amount: 96, account: 'Everyday Checking', member: 'Household' },
  { id: 't36', date: '2026-11-25', description: 'Bakery and market extras', category: 'Groceries', type: 'expense', amount: 46.8, account: 'Cash', member: 'Priya' },
  { id: 't37', date: '2026-11-26', description: 'Coffee with a neighbour', category: 'Dining Out', type: 'expense', amount: 12.6, account: 'Cash', member: 'Alex' },
];

export const GOALS = [
  { id: 'g1', name: 'Emergency fund', target: 12000, saved: 8450, monthly: 600, note: 'Three months of essentials, kept in Joint Savings.' },
  { id: 'g2', name: 'Family holiday — Lisbon', target: 3200, saved: 1860, monthly: 300, note: 'Flights and a small apartment, planned for next spring.' },
  { id: 'g3', name: 'New laptop for Priya', target: 1500, saved: 620, monthly: 150, note: 'Replacing the 2019 machine before it gives up.' },
  { id: 'g4', name: 'Home repairs cushion', target: 5000, saved: 2275, monthly: 100, note: 'Boiler service, a leaking tap, and whatever is next.' },
];

// status: 'paid' | 'upcoming'. paidOn is set when paid.
export const BILLS = [
  { id: 'b1', name: 'Rent', amount: 1850, dueDay: 1, status: 'paid', paidOn: '2026-11-01', account: 'Everyday Checking' },
  { id: 'b2', name: 'Gym membership', amount: 45, dueDay: 5, status: 'paid', paidOn: '2026-11-11', account: 'Everyday Checking' },
  { id: 'b3', name: 'Music app', amount: 11.99, dueDay: 10, status: 'paid', paidOn: '2026-11-10', account: 'Credit Card' },
  { id: 'b4', name: 'Streaming bundle', amount: 27.98, dueDay: 12, status: 'paid', paidOn: '2026-11-14', account: 'Credit Card' },
  { id: 'b5', name: 'Cloud storage', amount: 9.99, dueDay: 15, status: 'paid', paidOn: '2026-11-15', account: 'Credit Card' },
  { id: 'b6', name: 'Car insurance', amount: 148, dueDay: 20, status: 'paid', paidOn: '2026-11-20', account: 'Everyday Checking' },
  { id: 'b7', name: 'Internet', amount: 79, dueDay: 21, status: 'paid', paidOn: '2026-11-09', account: 'Everyday Checking' },
  { id: 'b8', name: 'Water', amount: 64.22, dueDay: 24, status: 'paid', paidOn: '2026-11-16', account: 'Everyday Checking' },
  { id: 'b9', name: 'Phone', amount: 96, dueDay: 28, status: 'paid', paidOn: '2026-11-24', account: 'Everyday Checking' },
  { id: 'b10', name: 'Home insurance', amount: 86, dueDay: 30, status: 'upcoming', paidOn: null, account: 'Everyday Checking' },
];

// Earlier months, for the trend chart. November is computed live from the records above.
export const HISTORY = [
  { month: 'Jun', income: 7790, spending: 5124, saved: 950 },
  { month: 'Jul', income: 8030, spending: 5388, saved: 900 },
  { month: 'Aug', income: 7915, spending: 4962, saved: 1100 },
  { month: 'Sep', income: 8105, spending: 5210, saved: 1150 },
  { month: 'Oct', income: 7860, spending: 4876, saved: 1200 },
];
