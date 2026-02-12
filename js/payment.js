const stripe = Stripe("pk_test_YOUR_PUBLISHABLE_KEY");

async function startPayment(packageType) {

    try {
        const response = await fetch("http://localhost:4242/create-checkout-session", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ packageType })
        });

        const session = await response.json();

        if (session.id) {
            stripe.redirectToCheckout({
                sessionId: session.id
            });
        } else {
            alert("Payment error. Try again.");
        }

    } catch (error) {
        console.error("Payment error:", error);
        alert("Server error. Please try later.");
    }
}

