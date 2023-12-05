window.onload = function() {
    // Parse the URL query parameters
    const queryParams = new URLSearchParams(window.location.search);
    const code = queryParams.get('code');
    const state = queryParams.get('state');

    // TODO: Validate the state parameter here to ensure it matches what you sent
    console.log("code:")
    console.log(code)

    if (code) {
        // Call the AWS Lambda function to handle the exchange of the code for tokens
        fetch('https://your-aws-lambda-url', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ authCode: code })
        })
        .then(response => response.json())
        .then(data => {
            // Handle the response here. For example, show a success message.
            console.log('Success:', data);
        })
        .catch((error) => {
            console.error('Error:', error);
        });
    } else {
        console.log('No code found in the URL query parameters.');
    }
};
