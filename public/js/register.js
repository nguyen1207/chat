const registerForm = document.querySelector("#register");

registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const username = document.querySelector("#username").value;
    const password = document.querySelector("#password").value;
    const errorElement = document.querySelector("#error");
    const submitBtn = document.querySelector("#submit");

    submitBtn.disabled = true;
    errorElement.textContent = "";

    try {
        // Send data to validate
        const res = await fetch("/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ username, password }),
        });

        const data = await res.json();

        if (data.error) {
            errorElement.textContent = data.error;
            submitBtn.disabled = false;
        } else {
            location.assign("/login");
        }
    } catch (err) {
        console.log(err);
    }
});
