document.getElementById('connect-withings').addEventListener('click', function() {
    const clientId = 'df1d4e76e73ba47f7f407e2babf7cee9d14557eacde2a334c53082b6aa586578'; // Replace with your client ID
    const redirectUri = encodeURIComponent('https://www.boostproductivity.co/connectWithWithingsCallback.html'); // Replace with your callback URL
    const scope = encodeURIComponent('user.info,user.metrics'); // Define the scopes you need

    const authUrl = `https://account.withings.com/oauth2_user/authorize2?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}&state=YOUR_RANDOM_STATE`;

    window.location.href = authUrl;
});
