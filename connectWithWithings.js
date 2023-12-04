document.getElementById('connect-withings').addEventListener('click', function() {
    const clientId = 'YOUR_CLIENT_ID'; // Replace with your client ID
    const redirectUri = encodeURIComponent('YOUR_CALLBACK_URL'); // Replace with your callback URL
    const scope = encodeURIComponent('user.info,user.metrics'); // Define the scopes you need

    const authUrl = `https://account.withings.com/oauth2_user/authorize2?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}&state=YOUR_RANDOM_STATE`;

    window.location.href = authUrl;
});
