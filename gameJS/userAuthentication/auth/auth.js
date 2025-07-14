const registration = () => {
  try {
    const userName = document.getElementById('registerUsername').value.toLowerCase();
    const password = document.getElementById('registerpassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    if (password !== confirmPassword) {
      alert('Both password fields should be exactly the same!');
      return false;
    }

    if (localStorage.getItem(userName)) {
      alert('Username already exists! Please enter a different username.');
      return false;
    }

    const user = {
      username: userName,
      password: password // In a real-world scenario, consider encrypting or hashing the password
    };

    localStorage.setItem(userName, JSON.stringify(user));
    alert('Registration is successful!');
    window.location.href = 'login.html';
    console.log(localStorage);

    return false;
  } catch (error) {
    console.error('An error occurred during registration:', error);
    return false;
  }
};

const logIn = () => {
  try {
    const userName = document.getElementById('username').value.toLowerCase();
    const password = document.getElementById('password').value;

    const storedUser = localStorage.getItem(userName);

    if (storedUser) {
      const user = JSON.parse(storedUser);
      if (user.password === password) {
        localStorage.setItem('loggedInUser', userName);
        alert('Login successful!');
        window.location.href = '../index.html';
      } else {
        alert('Incorrect password');
      }
    } else {
      alert('User not found. Please create an account to proceed!');
    }

    return false;
  } catch (error) {
    console.error('An error occurred during login:', error);
    return false;
  }
};
