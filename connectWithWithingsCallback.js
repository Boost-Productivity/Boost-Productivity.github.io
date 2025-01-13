window.onload = function () {
    // Parse the URL query parameters
    const queryParams = new URLSearchParams(window.location.search);
    const code = queryParams.get('code');
    const state = queryParams.get('state');

    // Parse the state parameter to get the user_id
    // The state parameter should contain the user_id when set in the initial auth request
    const user_id = "trace_beauchamp"; // Assuming state contains the user_id

    console.log("code:", code);
    console.log("user_id:", user_id);

    if (code && user_id) {
        // Call the Google Cloud Function to handle the exchange of the code for tokens
        fetch('https://us-central1-boost-productivity-126b9.cloudfunctions.net/handle_withings_auth', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                code: code,  // Changed from authCode to code to match the GCF
                user_id: user_id  // Added user_id parameter
            })
        })
            .then(response => {
                if (!response.ok) {
                    return response.json().then(err => {
                        throw new Error(err.error || `HTTP error! status: ${response.status}`);
                    });
                }
                return response.json();
            })
            .then(data => {
                // Handle the success response
                console.log('Success:', data);
                document.body.innerHTML = '<h2>Successfully connected with Withings!</h2>';
            })
            .catch((error) => {
                console.error('Error:', error);
                document.body.innerHTML = `<h2>Error connecting with Withings: ${error.message}</h2>`;
            });
    } else {
        const errorMessage = !code ? 'No authorization code found.' : 'No user ID found.';
        console.log(errorMessage);
        document.body.innerHTML = `<h2>${errorMessage} Please try connecting again.</h2>`;
    }
};
