const userList = document.getElementById('user-list');

fetch('http://localhost:3000/customers', {
  method: 'GET',
  headers: {
    'x-api-key': '12345' // Pass the API key as a header
  }
})
  .then(res => res.json())
  .then(data => {
    const users = data.customers; // Adjust to match your JSON structure
    users.forEach(user => {
      const div = document.createElement('div');
      div.className = 'user';
      div.innerHTML = `
        <p>CustomerId: ${user.customerId}</p>
        <h3>${user.name}</h3>
        <p>Email: ${user.email}</p>
        <p>City: ${user.address.city}</p>
        <p>Phone: ${user.phone}</p>
        <p>Status: ${user.isActive ? 'Active' : 'Inactive'}</p>
        <p>Gender: ${user.gender}</p>
        <p>DOB: ${user.dob}</p>
        <p>Zip code: ${user.address.postalCode}</p>
        <p>Country: ${user.address.country}</p>
      `;
      userList.appendChild(div);
    });
  })
  .catch(err => {
    userList.innerHTML = `<p>Failed to load data 😢</p>`;
    console.error("Fetch error:", err);
  });
