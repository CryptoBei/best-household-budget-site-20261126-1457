// Hearthledger entry point: hash routing between the six pages, and the event handling
// behind every control. Routes:
//   #/            dashboard — the month at a glance
//   #/budget      budget planner with editable planned amounts and the 50/30/20 check
//   #/ledger      searchable transaction ledger with an add-transaction form
//   #/goals       savings goals with contributions and a new-goal form
//   #/bills       bills and subscriptions, paid/unpaid toggles
//   #/insights    six-month trend, category shares and a what-if calculator
// window.__shotReady is false while a page renders and true once it is on screen, so a
// screenshot script knows when to capture.

import {
  addGoal,
  addTransaction,
  contributeToGoal,
  markBillPaid,
  markBillUpcoming,
  removeTransaction,
  setPlanned,
} from './store.js';
import { billsPage, budgetPage, dashboardPage, goalsPage, insightsPage, ledgerPage, missingPage } from './views.js';

const app = document.getElementById('app');
const navLinks = document.querySelectorAll('[data-nav]');

let ledgerFilters = { query: '', category: 'All', type: 'All' };
let whatIfInput = { category: 'Dining Out', trim: 25, extra: 100 };
let statusMessage = '';

const TITLES = {
  '/': 'Dashboard',
  '/budget': 'Budget planner',
  '/ledger': 'Ledger',
  '/goals': 'Savings goals',
  '/bills': 'Bills & subscriptions',
  '/insights': 'Insights',
};

function currentRoute() {
  const hash = location.hash.replace(/^#/, '') || '/';
  return TITLES[hash] ? hash : 'missing';
}

function render() {
  window.__shotReady = false;
  const route = currentRoute();
  let html;
  if (route === '/') html = dashboardPage();
  else if (route === '/budget') html = budgetPage();
  else if (route === '/ledger') html = ledgerPage(ledgerFilters);
  else if (route === '/goals') html = goalsPage();
  else if (route === '/bills') html = billsPage();
  else if (route === '/insights') html = insightsPage(whatIfInput);
  else html = missingPage();
  const status = statusMessage ? `<p class="status-banner" role="status">${statusMessage}</p>` : '';
  app.innerHTML = status + html;
  document.title = `${TITLES[route] || 'Not found'} · Hearthledger`;
  for (const link of navLinks) {
    if (link.getAttribute('data-nav') === route) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  }
  window.scrollTo(0, 0);
  window.__shotReady = true;
}

function formValues(form) {
  const values = {};
  for (const [key, value] of new FormData(form).entries()) values[key] = String(value).trim();
  return values;
}

function handleSubmit(event) {
  const form = event.target.closest('[data-form]');
  if (!form) return;
  event.preventDefault();
  const kind = form.getAttribute('data-form');
  const values = formValues(form);
  if (kind === 'add-transaction') {
    const amount = Number(values.amount);
    if (!values.description || !Number.isFinite(amount) || amount <= 0) return;
    const type = values.type === 'income' ? 'income' : 'expense';
    addTransaction({
      date: values.date || '2026-11-26',
      description: values.description,
      category: type === 'income' ? 'Income' : values.category,
      type,
      amount,
      account: values.account,
      member: values.member,
    });
    statusMessage = `Added “${values.description}”. Totals and charts now include it.`;
  } else if (kind === 'filter-ledger') {
    ledgerFilters = { query: values.query || '', category: values.category || 'All', type: values.type || 'All' };
    statusMessage = '';
  } else if (kind === 'set-planned') {
    const category = form.getAttribute('data-category');
    setPlanned(category, Number(values.planned));
    statusMessage = `Planned amount for ${category} updated.`;
  } else if (kind === 'contribute') {
    const goal = contributeToGoal(form.getAttribute('data-id'), Number(values.amount));
    statusMessage = goal ? `Added to ${goal.name}.` : '';
  } else if (kind === 'add-goal') {
    const target = Number(values.target);
    const monthly = Number(values.monthly);
    if (!values.name || !Number.isFinite(target) || target <= 0) return;
    addGoal({ name: values.name, target, monthly: Number.isFinite(monthly) ? monthly : 0, note: values.note || 'A new household goal.' });
    statusMessage = `Goal “${values.name}” added.`;
  } else if (kind === 'what-if') {
    whatIfInput = {
      category: values.category || 'Dining Out',
      trim: Math.min(90, Math.max(0, Number(values.trim) || 0)),
      extra: Math.max(0, Number(values.extra) || 0),
    };
    statusMessage = '';
  }
  render();
}

function handleClick(event) {
  const button = event.target.closest('[data-action]');
  if (!button) return;
  const action = button.getAttribute('data-action');
  const id = button.getAttribute('data-id');
  if (action === 'delete-transaction') {
    removeTransaction(id);
    statusMessage = 'Transaction deleted. Totals updated.';
  } else if (action === 'bill-paid') {
    const bill = markBillPaid(id);
    statusMessage = bill ? `${bill.name} marked paid.` : '';
  } else if (action === 'bill-upcoming') {
    const bill = markBillUpcoming(id);
    statusMessage = bill ? `${bill.name} marked unpaid again.` : '';
  } else {
    return;
  }
  render();
}

app.addEventListener('submit', handleSubmit);
app.addEventListener('click', handleClick);
window.addEventListener('hashchange', () => {
  statusMessage = '';
  render();
});
render();
