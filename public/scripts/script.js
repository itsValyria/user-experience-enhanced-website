document.addEventListener('DOMContentLoaded', function() {
  const likeCheckboxes = document.querySelectorAll('.heart-checkbox input[type="checkbox"]');

  likeCheckboxes.forEach(function(checkbox) {
    checkbox.addEventListener('change', function() {
      const serviceId = this.value;
      const likeCount = this.parentElement.querySelector('span');

      // If checkbox is checked, increase like count, otherwise decrease
      if (this.checked) {
        likeCount.textContent = parseInt(likeCount.textContent) + 1;
      } else {
        likeCount.textContent = parseInt(likeCount.textContent) - 1;
      }

      // Simulate form submission (optional)
      fetch('/like', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ like_id: serviceId })
      });
    });
  });
});