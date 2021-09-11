const loginForm = document.querySelector("#login");
loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const username = document.querySelector("#username").value;
    const password = document.querySelector("#password").value;
    const errorElement = document.querySelector("#error");
    const submitBtn = document.querySelector("#submit");

    submitBtn.disabled = true;
    errorElement.textContent = "";

    try {
        const response = await fetch("/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ username, password }),
        });

        const data = await response.json();

        if (data.error) {
            errorElement.textContent = data.error;
            submitBtn.disabled = false;
        } else {
            location.assign("/");
        }
    } catch (err) {
        console.log(err);
    }
});
