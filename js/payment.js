const stripe = Stripe("pk_live_YOUR_PUBLISHABLE_KEY");

const form = document.getElementById("payment-form");
const packageSelect = document.getElementById("package");
const summaryPackage = document.getElementById("summary-package");
const summaryPrice = document.getElementById("summary-price");
const loading = document.getElementById("loading");

const prices = {
    starter: 499,
    growth: 999,
    scale: 1999
};

packageSelect.addEventListener("change", () => {
    const selected = packageSelect.value;

    if (prices[selected]) {
        summaryPackage.innerText = selected.toUpperCase() + " Package";
        summaryPrice.innerText = "$" + prices[selected];
    } else {
        summaryPackage.innerText = "No package selected";
        summaryPrice.innerText = "$0";
    }
});

form.addEventListener("submit", async (e) => {
    e.preventDefault();

    loading.classList.remove("hidden");

    const packageType = packageSelect.value;

    if (!packageType) {
        alert("Please select a package");
        loading.classList.add("hidden");
        return;
    }

    try {
        const response = await fetch("https://your-backend-url.onrender.com/create-checkout-session", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ packageType })
        });

        const session = await response.json();

        await stripe.redirectToCheckout({
            sessionId: session.id
        });

    } catch (error) {
        alert("Payment error. Try again.");
        console.error(error);
        loading.classList.add("hidden");
    }
});
