document.addEventListener('DOMContentLoaded', () => {
  const services = document.querySelectorAll('input[type="checkbox"]');
  const totalSpan = document.getElementById('total-amount');
  const payBtn = document.getElementById('pay-btn');
  let total = 0;

  services.forEach(service => {
    service.addEventListener('change', () => {
      total = 0;
      services.forEach(s => {
        if (s.checked) total += parseInt(s.dataset.price);
      });
      totalSpan.textContent = total;
      payBtn.disabled = total === 0;
    });
  });

  payBtn.addEventListener('click', async () => {
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const phone = document.getElementById('phone').value.trim();

    if (!name || !email || !phone || total === 0) {
      alert('Please fill all details and select at least one service');
      return;
    }

    // Create order via your backend
    try {
      const response = await fetch('https://your-backend-url.onrender.com/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: total * 100 }) // in paise
      });
      const data = await response.json();

      const options = {
        key: 'YOUR_RAZORPAY_KEY_ID', // Test or live
        amount: total * 100,
        currency: 'INR',
        name: 'Instastrategix',
        description: 'Payment for Digital Marketing Services',
        order_id: data.order_id,
        handler: async (resp) => {
          // Verify payment
          const verifyRes = await fetch('https://your-backend-url.onrender.com/verify-payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              order_id: resp.razorpay_order_id,
              payment_id: resp.razorpay_payment_id,
              signature: resp.razorpay_signature
            })
          });
          const verifyData = await verifyRes.json();
          if (verifyData.success) {
            window.location.href = 'success.html';
          } else {
            window.location.href = 'failed.html';
          }
        },
        prefill: { name, email, contact: phone },
        theme: { color: '#3399cc' }
      };

      const rzp = new Razorpay(options);
      rzp.open();
    } catch (err) {
      alert('Payment initiation failed. Try again.');
    }
  });
});
