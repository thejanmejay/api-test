const apiKey = '12345'; // Declare your API key
const userList = document.getElementById('user-list');

async function fetchCustomers() {
  try {
    const res = await fetch(`${baseUrl}/customers`);
    if (!res.ok) {
      throw new Error('Failed to fetch customers');
    }
    const data = await res.json();
    display(data);
  } catch (error) {
    console.error('Error fetching customers:', error);
    alert('Error fetching customers. Check the console for details.');
  }
}


async function getCustomerById() {
  const id = document.getElementById('customerId').value;
  
  // Check if the ID is valid (numeric and non-empty)
  if (!id || isNaN(id)) {
    alert('Please enter a valid ID');
    return;
  }
  
  try {
    // Fetch customer data from API using the provided ID
    const res = await fetch(`${baseUrl}/customers/${id}`);
    
    // Check if the response is not ok (status code 2xx)
    if (!res.ok) throw new Error('Customer not found');
    
    const data = await res.json(); // Parse the response JSON
    
    console.log('Customer data:', data);  // Debugging log to see the response
    
    display(data); // Call the display function to show the data on the UI
  } catch (error) {
    console.error('Error:', error);  // Log the error to the console for debugging
    alert('Customer not found');
  }
}


async function addCustomer() {
  const id = parseInt(document.getElementById('newId').value);
  const name = document.getElementById('newName').value;
  const email = document.getElementById('newEmail').value;

  const customer = { customerId: id, name, email };
  try {
    const res = await fetch(`${baseUrl}/customers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey
      },
      body: JSON.stringify(customer)
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error('Failed to add customer');
    }
    display(data);
  } catch (error) {
    console.error('Error adding customer:', error);
    alert('Error adding customer. Check the console for details.');
  }
}

