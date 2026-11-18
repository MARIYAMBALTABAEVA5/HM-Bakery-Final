const $ = id => document.getElementById(id);
const theme = $('theme');
function applyTheme() {
  const dark = localStorage.getItem('theme') === 'dark';
  document.documentElement.classList.toggle('dark', dark);
  theme.textContent = dark ? 'Light mode' : 'Dark mode';
}
applyTheme();
theme.onclick = () => {
  localStorage.setItem('theme', document.documentElement.classList.contains('dark') ? 'light' : 'dark');
  applyTheme();
};
// Validate only fields that are present in each form.
function validate(form) {
  let valid = true;
  const data = Object.fromEntries(new FormData(form));
  for (const [name, raw] of Object.entries(data)) {
    const value = raw.trim();
    let error = '';
    if (!value) error = 'Please fill in this field.';
    else if (name === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) error = 'Enter a valid email address.';
    else if (name === 'phone' && !/^\+?[0-9]{10,15}$/.test(value.replace(/[ ()-]/g, ''))) error = 'Enter a valid phone number (10–15 digits).';
    else if (name === 'password' && !(raw.length >= 8 && /[A-Z]/.test(raw) && /[a-z]/.test(raw) && /[0-9]/.test(raw) && /[^A-Za-z0-9\s]/.test(raw))) error = 'Use 8+ characters, uppercase, lowercase, number and symbol.';
    form.querySelector(`[data-error="${name}"]`).textContent = error;
    if (error) valid = false;
  }
  return valid ? data : null;
}
function feedback(form, message) { form.querySelector('.feedback').textContent = message; }
// Local account simulation only; never use real passwords.
function accounts() { return JSON.parse(localStorage.getItem('bakeryUsers') || '[]'); }
$('signup-form')?.addEventListener('submit', event => {
  event.preventDefault();
  const form = event.currentTarget, data = validate(form);
  feedback(form, '');
  if (!data) return;
  data.email = data.email.trim().toLowerCase();
  const users = accounts();
  if (users.some(user => user.email === data.email)) return feedback(form, 'This email is already registered.');
  users.push(data);
  localStorage.setItem('bakeryUsers', JSON.stringify(users));
  location.href = 'login.html';
});
$('login')?.addEventListener('submit', event => {
  event.preventDefault();
  const form = event.currentTarget, data = validate(form);
  feedback(form, '');
  if (!data) return;
  const user = accounts().find(u => u.email === data.email.trim().toLowerCase() && u.password === data.password);
  if (!user) return feedback(form, 'Incorrect email or password.');
  localStorage.setItem('bakerySession', user.email);
  location.href = 'profile.html';
});
if ($('profile')) {
  const user = accounts().find(u => u.email === localStorage.getItem('bakerySession'));
  if (!user) {
    const link = document.createElement('a');
    link.href = 'login.html'; link.textContent = 'Log in to view your profile';
    $('profile').append(link);
  } else {
    for (const [label, value] of [['Name', user.name], ['Email', user.email], ['Phone', user.phone]]) {
      const line = document.createElement('p'); line.textContent = `${label}: ${value}`; $('profile').append(line);
    }
    const button = document.createElement('button'); button.textContent = 'Log out';
    button.onclick = () => { localStorage.removeItem('bakerySession'); location.href = 'login.html'; };
    $('profile').append(button);
  }
}
$('contact')?.addEventListener('submit', event => {
  event.preventDefault();
  const form = event.currentTarget, data = validate(form);
  feedback(form, '');
  if (!data) return;
  localStorage.setItem('bakeryMessage', JSON.stringify(data));
  form.reset(); feedback(form, 'Message saved locally (demo).');
});
if ($('search')) {
  function filter() {
    const query = $('search').value.trim().toLowerCase();
    let count = 0;
    for (const item of $('products').children) {
      item.hidden = !item.textContent.toLowerCase().includes(query);
      if (!item.hidden) count++;
    }
    $('results').textContent = `${count} products found`;
  }
  $('search').addEventListener('input', filter); filter();
}
// Retrieve dessert content from TheMealDB public API.
async function loadDesserts() {
  try {
    const response = await fetch('https://www.themealdb.com/api/json/v1/1/filter.php?c=Dessert');
    if (!response.ok) throw new Error();
    const { meals } = await response.json();
    if (!meals?.length) throw new Error();
    for (const meal of meals.slice(0, 4)) {
      const card = document.createElement('article'); card.className = 'item';
      const image = document.createElement('img'); image.src = meal.strMealThumb; image.alt = meal.strMeal;
      const title = document.createElement('h2'); title.textContent = meal.strMeal;
      card.append(image, title); $('recipes').append(card);
    }
    $('recipe-status').textContent = 'Desserts from TheMealDB';
  } catch {
    $('recipe-status').textContent = 'Unable to load desserts. Please try again later.';
  }
}
if ($('recipes')) loadDesserts();
