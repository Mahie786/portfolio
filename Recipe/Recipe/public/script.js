const studentID = "M00804091";
const baseRoute = `/${studentID}`;

document.addEventListener("DOMContentLoaded", function () {
  loadRecipes();
  loadUsers();
  checkLoginStatus();
});

function checkLoginStatus() {
  const loggedIn = localStorage.getItem("isLoggedIn") === "true"; // Compare against string 'true'

  const loginLink = document.querySelector('a[href="#login"]');
  const registerLink = document.querySelector('a[href="#register"]');
  const followersLink = document.querySelector('a[href="#follows"]');
  const uploadLink = document.querySelector('a[href="#upload"]');
  const searchForm = document.getElementById("search");
  const followedRecipesSection = document.getElementById("followed-recipes");

  const loginSection = document.getElementById("login");
  const registerSection = document.getElementById("register");
  const followersSection = document.getElementById("follows");
  const uploadSection = document.getElementById("upload");
  const searchSection = document.getElementById("search");

  if (loggedIn) {
    // User is logged in
    loginLink.style.display = "none";
    registerLink.style.display = "none";
    followersLink.style.display = "inline";
    uploadLink.style.display = "inline";
    searchForm.style.display = "inline-block";

    loginSection.style.display = "none";
    registerSection.style.display = "none";
    followersSection.style.display = "block";
    uploadSection.style.display = "block";
    searchSection.style.display = "block";
    followedRecipesSection.style.display = "block";

    loadFollowedRecipes(localStorage.getItem("currentUserId"));
  } else {
    // User is not logged in
    loginLink.style.display = "inline";
    registerLink.style.display = "inline";
    followersLink.style.display = "none";
    uploadLink.style.display = "none";
    searchForm.style.display = "none";
    followedRecipesSection.style.display = "none";

    loginSection.style.display = "block";
    registerSection.style.display = "block";
    followersSection.style.display = "none";
    uploadSection.style.display = "none";
    searchSection.style.display = "none";
  }

  const logoutButton = document.getElementById("logoutButton");
  if (loggedIn) {
    logoutButton.style.display = "inline-block";
  } else {
    logoutButton.style.display = "none";
  }

  console.log("Logged In Status:", localStorage.getItem("isLoggedIn"));
}

function loadRecipes() {
  fetch(`${baseRoute}/recipes`)
    .then((response) => response.json())
    .then((recipes) => {
      const recipesContainer = document.getElementById("recipes");
      recipesContainer.innerHTML = "";
      recipes.forEach((recipe) => {
        const recipeDiv = document.createElement("div");
        recipeDiv.classList.add("recipe-card");
        let commentsHtml = recipe.comments
          ? recipe.comments
              .map(
                (comment) =>
                  `<div><strong>Comment:</strong> ${comment.text}</div>`
              )
              .join("")
          : "<div>No comments yet.</div>";
        let reviewsHtml = recipe.reviews
          ? recipe.reviews
              .map(
                (review) =>
                  `<div><strong>Rating:</strong> ${"★".repeat(
                    review.rating
                  )}</div>`
              )
              .join("")
          : "<div>No reviews yet.</div>";
        recipeDiv.innerHTML = `
                    <h3>${recipe.title}</h3>
                    <p><strong>Ingredients:</strong><br>${recipe.ingredients.join(
                      ", "
                    )}</p>
                    <p><strong>Instructions:</strong><br>${
                      recipe.instructions
                    }</p>
                    <img src="/uploads/${recipe.imagePath}" alt="${
          recipe.title
        }">
                    <p>Posted by: ${
                      recipe.user ? recipe.user.username : "unknown"
                    }</p> <!-- Handle missing user info -->
                    ${commentsHtml}
                    <textarea id="comment-${
                      recipe._id
                    }" placeholder="Add a comment..."></textarea>
                    <button onclick="postComment('${recipe._id}')">Send</button>
                    ${reviewsHtml}
                    <div class="review">${renderStars()}</div>
                    <button onclick="postReview('${
                      recipe._id
                    }')">Submit Review</button>
                `;
        recipesContainer.appendChild(recipeDiv);
      });
    })
    .catch((error) => {
      console.error("Error loading recipes:", error);
      recipesContainer.innerHTML =
        "<p>Error loading recipes. Please try again later.</p>";
    });
}

function renderStars() {
  let starsHtml = "";
  for (let i = 1; i <= 5; i++) {
    starsHtml += `<span class="star" onclick="setRating(${i})">&#9733;</span>`; // Star character
  }
  return starsHtml;
}

function postComment(recipeId) {
  const commentText = document.getElementById(`comment-${recipeId}`).value;
  const userId = localStorage.getItem("currentUserId"); 

  if (!commentText.trim()) {
    alert("Comment text is empty.");
    return;
  }

  fetch(`${baseRoute}/recipes/${recipeId}/comments`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ userId, text: commentText }),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Failed to post comment");
      }
      return response.json();
    })
    .then((data) => {
      alert(data.message);
      document.getElementById(`comment-${recipeId}`).value = ""; 
    })
    .catch((error) => {
      console.error("Error posting comment:", error);
      alert("Error posting comment. Please try again.");
    });
}

let currentRating = 0;

function setRating(rating, recipeId) {
  currentRating = rating; 
  const stars = document.querySelectorAll(`#recipe-${recipeId} .star`);
  stars.forEach((star, index) => {
    if (index < rating) {
      star.classList.add("selected");
    } else {
      star.classList.remove("selected");
    }
  });
}

function renderStars(recipeId) {
  let starsHtml = "";
  for (let i = 1; i <= 5; i++) {
    starsHtml += `<span class="star" onclick="setRating(${i}, '${recipeId}')">&#9733;</span>`; // Star character
  }
  return starsHtml;
}

function postReview(recipeId) {
  if (!currentRating) {
    alert("Please select a rating before submitting your review.");
    return;
  }

  const payload = {
    userId: localStorage.getItem("currentUserId"), // Ensure userID is stored in localStorage upon login
    rating: currentRating,
  };

  fetch(`${baseRoute}/recipes/${recipeId}/reviews`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Failed to post review");
      }
      return response.json();
    })
    .then((data) => {
      alert("Review submitted successfully!");
      console.log(data);
      // Reset the rating after submitting
      currentRating = 0;
      setRating(0, recipeId);
    })
    .catch((error) => {
      console.error("Error posting review:", error);
      alert("Failed to post review. Check console for details.");
    });
}

function loadUsers() {
  const currentUserId = localStorage.getItem("currentUserId"); // Retrieve current user ID from local storage
  if (!currentUserId) {
    console.error("No current user ID available.");
    return;
  }

  fetch(`${baseRoute}/users`)
    .then((response) => response.json())
    .then((users) => {
      const usersContainer = document.getElementById("users");
      usersContainer.innerHTML = "";

      users.forEach((user) => {
        const userDiv = document.createElement("div");
        userDiv.innerHTML = `<span>${user.username}</span> <button class="follow-button" onclick="followUser('${currentUserId}', '${user._id}')">Follow</button>`;
        usersContainer.appendChild(userDiv);
      });
    })
    .catch((error) => console.error("Error:", error));
}

function followUser(followerId, followedId) {
  console.log("Following:", followerId, "->", followedId); // Add this to check the IDs

  if (!followerId || !followedId) {
    alert("Invalid IDs for following");
    return;
  }

  fetch(`${baseRoute}/follow`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ followerId, followedId }),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Failed to execute follow");
      }
      return response.json();
    })
    .then((data) => {
      alert(data.message);
    })
    .catch((error) => {
      console.error("Error:", error);
      alert("Failed to follow user. Check console for details.");
    });
}

function register() {
  const username = document.getElementById("regUsername").value;
  const password = document.getElementById("regPassword").value;
  const email = document.getElementById("regEmail").value;

  if (!email.match(/^[^@]+@[^@]+\.[^@]+$/)) {
    alert("Please enter a valid email address.");
    return;
  }

  if (password.length < 8) {
    alert("Password must be at least 8 characters long.");
    return;
  }

  fetch(`${baseRoute}/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username, password, email }),
  })
    .then((response) => response.json())
    .then((data) => alert(data.message))
    .catch((error) => console.error("Error:", error));
}

function login() {
  const username = document.getElementById("logUsername").value;
  const password = document.getElementById("logPassword").value;

  fetch(`${baseRoute}/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username, password }),
  })
    .then((response) => response.json())
    .then((data) => {
      alert(data.message);
      if (data.isLoggedIn) {
        localStorage.setItem("currentUserId", data.userId); // Storing user ID from the login response
        localStorage.setItem("isLoggedIn", true); // Storing login status
        loadFollowedRecipes(data.userId); // Load recipes right after login
        checkLoginStatus(); // Update UI based on login status
      } else {
        console.error("Login failed: ", data.error);
      }
    })
    .catch((error) => {
      console.error("Login error:", error);
      alert("Login failed, please check console for details.");
    });
}

function logout() {
  // This function should be added to allow users to log out
  localStorage.removeItem("isLoggedIn");
  checkLoginStatus();
}

function uploadContent() {
  const title = document.getElementById("contentTitle").value;
  const ingredients = document.getElementById("contentIngredients").value;
  const instructions = document.getElementById("contentInstructions").value;
  const image = document.getElementById("contentImage").files[0];

  const formData = new FormData();
  formData.append("title", title);
  formData.append("ingredients", ingredients);
  formData.append("instructions", instructions);
  formData.append("image", image);
  formData.append("userId", localStorage.getItem("currentUserId")); // Ensure you are storing userId in localStorage upon login

  fetch(`${baseRoute}/upload`, {
    method: "POST",
    body: formData,
  })
    .then((response) => response.json())
    .then((data) => {
      alert(data.message);
      if (data.error) {
        console.error("Upload Error:", data.error);
      }
    })
    .catch((error) => console.error("Error during upload:", error));
}

function searchUsers(event) {
  event.preventDefault(); // Prevent the form from submitting traditionally

  const searchTerm = document.getElementById("searchTerm").value;
  const resultsContainer = document.getElementById("resultsContainer");
  document.getElementById("search-results").style.display = "block"; // Ensure the search results section is visible

  fetch(`${baseRoute}/search?searchTerm=${searchTerm}`)
    .then((response) => {
      if (!response.ok) {
        throw new Error("Failed to fetch search results");
      }
      return response.json();
    })
    .then((result) => {
      resultsContainer.innerHTML = ""; // Clear previous results

      if (result.type === "users") {
        // Create a container for user results
        const usersList = document.createElement("div");
        usersList.className = "users-list";

        result.data.forEach((user) => {
          const userDiv = document.createElement("div");
          userDiv.className = "user-item";
          userDiv.innerHTML = `
                        <span class="user-name">${user.username}</span>
                        <button class="follow-button" onclick="followUser('${localStorage.getItem(
                          "currentUserId"
                        )}', '${user._id}')">Follow</button>
                    `;
          usersList.appendChild(userDiv);
        });

        resultsContainer.appendChild(usersList);
      } else if (result.type === "recipes") {
        // Create a grid container for recipes
        const recipesGrid = document.createElement("div");
        recipesGrid.className = "recipes-grid";

        result.data.forEach((recipe) => {
          const recipeDiv = document.createElement("div");
          recipeDiv.classList.add("recipe-card");
          recipeDiv.innerHTML = `
                        <h3>${recipe.title}</h3>
                        <p><strong>Ingredients:</strong> ${recipe.ingredients.join(
                          ", "
                        )}</p>
                        <p><strong>Instructions:</strong> ${
                          recipe.instructions
                        }</p>
                        <img src="/uploads/${recipe.imagePath}" alt="${
            recipe.title
          }">
                    `;
          recipesGrid.appendChild(recipeDiv);
        });

        resultsContainer.appendChild(recipesGrid);
      } else {
        resultsContainer.innerHTML =
          "<p class='no-results'>No results found.</p>";
      }
    })
    .catch((error) => {
      console.error("Error during search:", error);
      resultsContainer.innerHTML = `<p class='search-error'>Error performing search. See console for details.</p>`;
    });
}

document.addEventListener("DOMContentLoaded", function () {
  const userId = localStorage.getItem("userId");
  if (userId) {
    loadFollowedRecipes(userId);
  }
});

function loadFollowedRecipes(userId) {
  console.log("Loading followed recipes for user:", userId); // Debug log
  fetch(`${baseRoute}/followedRecipes/${userId}`)
    .then((response) => {
      if (!response.ok) {
        throw new Error("Failed to fetch recipes");
      }
      return response.json();
    })
    .then((recipes) => {
      const followedRecipesContainer =
        document.getElementById("followed-recipes");
      if (recipes.length === 0) {
        followedRecipesContainer.innerHTML =
          "<p>No recipes found from followed users.</p>";
      } else {
        followedRecipesContainer.innerHTML = "";
        recipes.forEach((recipe) => {
          const recipeDiv = document.createElement("div");
          recipeDiv.classList.add("recipe-card");
          recipeDiv.innerHTML = `
                      <h3>${recipe.title}</h3>
                      <p><strong>Ingredients:</strong><br>${recipe.ingredients.join(
                        ", "
                      )}</p>
                      <p><strong>Instructions:</strong><br>${
                        recipe.instructions
                      }</p>
                      <img src="/uploads/${recipe.imagePath}" alt="${
            recipe.title
          }">
                  `;
          followedRecipesContainer.appendChild(recipeDiv);
        });
      }
    })
    .catch((error) => {
      console.error("Error fetching followed recipes:", error);
      alert("Error fetching followed recipes. Check console for details.");
    });
}
