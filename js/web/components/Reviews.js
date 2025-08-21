function getReviewsbyUser(movie_id) {
    fetch(`php/reviews.php?movie_id=${movie_id}`)
    .then((response) => response.json())
    .then((data) => {
      displayReviews(data);
    })
    .catch((error) => {
      console.error("Error al obtener reseñas de la pelicula:", error);
    });
}

function renderReviewCard(reviewData, container) {
  const review = document.createElement("div");
  review.className = "card";
  review.innerHTML = `
    <div>
      <h2>${reviewData.usuario}</h2>
      <p>${reviewData.review}</p>
      <p>${reviewData.puntuacion}</p>
    </div>
  `;
  container.appendChild(review);
}

function displayReviews(data) {
    const goodReviewContainer = document.getElementById("opinionCardsGood");
    const badReviewContainer = document.getElementById("opinionCardsBad");
    
    data.forEach((review) => {
      const container = review.puntuacion >= MINIMUM_GOOD_RATING ? goodReviewContainer : badReviewContainer;
      renderReviewCard(review, container);
    });
  }

  export { getReviewsbyUser, displayReviews };