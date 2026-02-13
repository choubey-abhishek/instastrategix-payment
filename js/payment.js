document.addEventListener('DOMContentLoaded', () => {
  const services = document.querySelectorAll('input[type="checkbox"]');
  const totalSpan = document.getElementById('total-amount');
  const payBtn = document.getElementById('pay-btn');
  let total = 0;

  // Update total when checkboxes change
  services.forEach(service => {
    service.addEventListener('change', () => {
      total = 0;
      services.forEach(s => {
        if (s.checked) {
          total += parseInt(s.dataset.price);
        }
      });
      totalSpan.textContent = total.toLocaleString('en-IN'); // Indian comma formatting
      payBtn.disabled = total === 0;
    });
  });

  // Handle Pay button click
  payBtn.addEventListener('click', async () => {
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const phone = document.getElementById('phone').value.trim();

    if (!name || !email || !phone || total === 0) {
      alert('Please fill in all details and select at least one service.');
      return;
    }

    try {
      // Step 1: Create order on your backend
      const orderResponse = await fetch('https://your-backend-url.onrender.com/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: total * 100 }) // Razorpay expects paise
      });

      if (!orderResponse.ok) throw new Error('Order creation failed');

      const orderData = await orderResponse.json();

      // Step 2: Open Razorpay checkout
      const options = {
        key: 'YOUR_RAZORPAY_KEY_ID', // Replace with your Razorpay test/live key
        amount: total * 100,
        currency: 'INR',
        name: 'Instastrategix',
        description: 'Monthly Digital Marketing Services',
        order_id: orderData.order_id,
        handler: async (response) => {
          // Step 3: Verify payment on backend
          const verifyResponse = await fetch('https://your-backend-url.onrender.com/verify-payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              order_id: response.razorpay_order_id,
              payment_id: response.razorpay_payment_id,
              signature: response.razorpay_signature
            })
          });

          const verifyData = await verifyResponse.json();

          if (verifyData.success) {
            window.location.href = 'success.html';
          } else {
            alert('Payment verification failed. Please contact support.');
            window.location.href = 'failed.html';
          }
        },
        prefill: {
          name: name,
          email: email,
          contact: phone
        },
        theme: {
          color: '#3399cc'
        },
        modal: {
          ondismiss: () => {
            alert('Payment cancelled. You can try again.');
          }
        }
      };

      const rzp = new Razorpay(options);
      rzp.open();

    } catch (error) {
      console.error(error);
      alert('Something went wrong. Please try again or contact us.');
    }
  });
});
