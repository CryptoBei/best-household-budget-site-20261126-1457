// State and arithmetic for Hearthledger. The store starts from the seed records in
// data.js, keeps every change the household makes (a new transaction, an edited budget,
// a paid bill, a goal contribution), and computes the totals every page reads. Nothing
// is hard-coded in the views: if a number is on screen, it came from here.

import { BILLS, CATEGORIES, DAY_OF_MONTH, DAYS_IN_MONTH, GOALS, HISTORY, TRANSACTIONS } from './data.js';

export const state = {
  categories: CATEGORIES.map((c) => ({ ...c })),
  transactions: TRANSACTIONS.map((t) => ({ ...t })),
  goals: GOALS.map((g) => ({ ...g })),
  bills: BILLS.map((b) => ({ ...b })),
  nextId: 100,
};

export function money(value) {
  const sign = value < 0 ? '-' : '';
  const abs = Math.abs(value);
  return `${sign}$${abs.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function moneyWhole(value) {
  const sign = value < 0 ? '-' : '';
  return `${sign}$${Math.abs(Math.round(value)).toLocaleString('en-US')}`;
}

export function percent(part, whole) {
  if (!whole) return 0;
  return Math.round((part / whole) * 100);
}

export function categoryByName(name) {
  return state.categories.find((c) => c.name === name);
}

export function totalIncome() {
  return state.transactions.filter((t) => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
}

export function totalSpending() {
  return state.transactions.filter((t) => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
}

export function spentInCategory(name) {
  return state.transactions
    .filter((t) => t.type === 'expense' && t.category === name)
    .reduce((sum, t) => sum + t.amount, 0);
}

export function categoryRows() {
  return state.categories.map((category) => {
    const spent = spentInCategory(category.name);
    return {
      ...category,
      spent,
      remaining: category.planned - spent,
      usedPercent: percent(spent, category.planned),
    };
  });
}

export function totalPlanned() {
  return state.categories.reduce((sum, c) => sum + c.planned, 0);
}

export function monthlySavings() {
  return state.goals.reduce((sum, g) => sum + g.monthly, 0);
}

export function savingsRate() {
  return percent(monthlySavings(), totalIncome());
}

export function leftToAllocate() {
  return totalIncome() - totalSpending() - monthlySavings();
}

export function daysLeftInMonth() {
  return DAYS_IN_MONTH - DAY_OF_MONTH;
}

export function monthElapsedPercent() {
  return percent(DAY_OF_MONTH, DAYS_IN_MONTH);
}

// Categories spending faster than the calendar: used% ahead of elapsed% by 8 points or more.
export function paceWarnings() {
  const elapsed = monthElapsedPercent();
  return categoryRows()
    .filter((row) => row.usedPercent >= elapsed + 8 && row.remaining >= 0)
    .sort((a, b) => b.usedPercent - a.usedPercent);
}

export function overspentCategories() {
  return categoryRows().filter((row) => row.remaining < 0);
}

export function groupTotals() {
  const rows = categoryRows();
  const needs = rows.filter((r) => r.group === 'needs').reduce((sum, r) => sum + r.spent, 0);
  const wants = rows.filter((r) => r.group === 'wants').reduce((sum, r) => sum + r.spent, 0);
  const income = totalIncome();
  return {
    needs,
    wants,
    saved: monthlySavings(),
    needsPercent: percent(needs, income),
    wantsPercent: percent(wants, income),
    savedPercent: percent(monthlySavings(), income),
  };
}

export function recentTransactions(count) {
  return [...state.transactions]
    .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0))
    .slice(0, count);
}

export function filterTransactions({ query, category, type }) {
  const q = (query || '').trim().toLowerCase();
  return [...state.transactions]
    .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0))
    .filter((t) => {
      if (category && category !== 'All' && t.category !== category) return false;
      if (type && type !== 'All' && t.type !== type) return false;
      if (q && !`${t.description} ${t.category} ${t.member} ${t.account}`.toLowerCase().includes(q)) return false;
      return true;
    });
}

export function addTransaction(fields) {
  state.nextId += 1;
  const transaction = { id: `t${state.nextId}`, ...fields };
  state.transactions.push(transaction);
  return transaction;
}

export function removeTransaction(id) {
  state.transactions = state.transactions.filter((t) => t.id !== id);
}

export function setPlanned(categoryName, planned) {
  const category = categoryByName(categoryName);
  if (category && Number.isFinite(planned) && planned >= 0) category.planned = planned;
}

export function addGoal(fields) {
  state.nextId += 1;
  const goal = { id: `g${state.nextId}`, saved: 0, ...fields };
  state.goals.push(goal);
  return goal;
}

export function contributeToGoal(id, amount) {
  const goal = state.goals.find((g) => g.id === id);
  if (goal && Number.isFinite(amount) && amount > 0) {
    goal.saved = Math.min(goal.target, goal.saved + amount);
  }
  return goal;
}

export function goalMonthsLeft(goal) {
  const remaining = goal.target - goal.saved;
  if (remaining <= 0) return 0;
  if (!goal.monthly) return null;
  return Math.ceil(remaining / goal.monthly);
}

export function goalFinishLabel(goal) {
  const months = goalMonthsLeft(goal);
  if (months === 0) return 'Reached';
  if (months === null) return 'No monthly amount set';
  const names = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const index = (10 + months) % 12; // November is index 10; add whole months from here.
  const year = 2026 + Math.floor((10 + months) / 12);
  return `${names[index]} ${year}`;
}

export function upcomingBills() {
  return state.bills.filter((b) => b.status === 'upcoming').sort((a, b) => a.dueDay - b.dueDay);
}

export function billsDueTotal() {
  return upcomingBills().reduce((sum, b) => sum + b.amount, 0);
}

export function markBillPaid(id) {
  const bill = state.bills.find((b) => b.id === id);
  if (bill) {
    bill.status = 'paid';
    bill.paidOn = '2026-11-26';
  }
  return bill;
}

export function markBillUpcoming(id) {
  const bill = state.bills.find((b) => b.id === id);
  if (bill) {
    bill.status = 'upcoming';
    bill.paidOn = null;
  }
  return bill;
}

export function trendRows() {
  return [
    ...HISTORY,
    { month: 'Nov', income: Math.round(totalIncome()), spending: Math.round(totalSpending()), saved: monthlySavings() },
  ];
}

export function largestCategory() {
  return categoryRows().sort((a, b) => b.spent - a.spent)[0];
}

export function subscriptionTotal() {
  return spentInCategory('Subscriptions');
}

export function averageDailySpending() {
  return totalSpending() / DAY_OF_MONTH;
}

export function projectedMonthEndSpending() {
  return averageDailySpending() * DAYS_IN_MONTH;
}

// What-if: trim a category by a percentage and add a flat extra saving each month.
export function whatIf(categoryName, trimPercent, extraSaving) {
  const spent = spentInCategory(categoryName);
  const trimmed = (spent * trimPercent) / 100;
  const monthlyGain = trimmed + extraSaving;
  return {
    spent,
    trimmed,
    monthlyGain,
    yearlyGain: monthlyGain * 12,
    newSavingsRate: percent(monthlySavings() + monthlyGain, totalIncome()),
  };
}
