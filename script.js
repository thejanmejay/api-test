const baseUrl = 'http://localhost:5000';
const apiKey = '12345';
const userList = document.getElementById('user-list');
let customerData = [];
let sortOrder = 'asc';

document.getElementById("dob").setAttribute("max", new Date().toISOString().split("T")[0]);

function display(data) {
  userList.innerHTML = '';

  if ((!Array.isArray(data) && !data.customerId) || (Array.isArray(data) && data.length === 0)) {
    userList.innerHTML = '<p>No customer data found.</p>';
    return;
  }

  const table = document.createElement('table');
  table.classList.add('customer-table');

  table.innerHTML = `
    <thead>
      <tr>
        <th>ID</th><th>Name</th><th>Email</th><th>City</th>
        <th>Postal Code</th><th>Country</th><th>Phone</th>
        <th>DOB</th><th>Gender</th><th>Active</th>
      </tr>
    </thead>
    <tbody>
      ${Array.isArray(data) ? data.map(renderRow).join('') : renderRow(data)}
    </tbody>
  `;

  userList.appendChild(table);
}

function renderRow(user) {
  return `
    <tr>
      <td>${user.customerId}</td>
      <td>${user.name}</td>
      <td>${user.email}</td>
      <td>${user.address?.city || ''}</td>
      <td>${user.address?.postalCode || ''}</td>
      <td>${user.address?.country || ''}</td>
      <td>${user.phone}</td>
      <td>${user.dob}</td>
      <td>${user.gender}</td>
      <td>${user.isActive ? 'Yes' : 'No'}</td>
    </tr>
  `;
}

async function fetchCustomers() {
  try {
    const res = await fetch(`${baseUrl}/customers`);
    if (!res.ok) throw new Error('Failed to fetch customers');
    const data = await res.json();
    customerData = data;
    display(data);
  } catch (error) {
    console.error('Error fetching customers:', error);
    alert('Error fetching customers. Check the console.');
  }
}

async function getCustomerById() {
  const id = document.getElementById('customerId').value;
  if (!id || isNaN(id)) {
    alert('Please enter a valid ID');
    return;
  }
  try {
    const res = await fetch(`${baseUrl}/customers/${id}`);
    if (!res.ok) throw new Error('Customer not found');
    const data = await res.json();
    display(data);
  } catch (error) {
    console.error('Error:', error);
    alert('Customer not found');
  }
}

async function addCustomer() {
  const customer = {
    customerId: parseInt(document.getElementById('newId').value),
    name: document.getElementById('newName').value,
    email: document.getElementById('newEmail').value,
    address: {
      city: document.getElementById('city').value,
      postalCode: document.getElementById('postalCode').value,
      country: document.getElementById('country').value
    },
    phone: document.getElementById('newPhone').value,
    isActive: document.getElementById('isActive').checked,
    gender: document.getElementById('gender').value,
    dob: document.getElementById('dob').value
  };

  if (!customer.customerId || !customer.name || !customer.email || !customer.phone || !customer.gender || !customer.dob ||
    !customer.address.city || !customer.address.postalCode || !customer.address.country) {
    alert('Please fill all fields correctly.');
    return;
  }

  try {
    const res = await fetch(`${baseUrl}/customers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey
      },
      body: JSON.stringify(customer)
    });

    if (!res.ok) throw new Error('Failed to add customer');
    const data = await res.json();
    alert(data.message || 'Customer added');
    display(data.customer || data);
  } catch (error) {
    console.error('Error adding customer:', error);
    alert('Error adding customer');
  }
}

function sortCustomersById() {
  sortOrder = (sortOrder === 'asc') ? 'desc' : 'asc';

  const sortedData = [...customerData].sort((a, b) => {
    return sortOrder === 'asc' ? a.customerId - b.customerId : b.customerId - a.customerId;
  });

  const sortIcon = document.getElementById('sort-icon');
  sortIcon.classList.toggle('fa-sort-up', sortOrder === 'asc');
  sortIcon.classList.toggle('fa-sort-down', sortOrder === 'desc');

  display(sortedData);
}
