document.addEventListener('DOMContentLoaded', function() {
  const likeCheckboxes = document.querySelectorAll('.heart-checkbox input[type="checkbox"]');

  // Voor elke checkbox, add eventListener change, en als hij gechanged is...
  likeCheckboxes.forEach(function(checkbox) {
    checkbox.addEventListener('change', async function() {
      const serviceId = this.value;
      const likeCount = this.parentElement.querySelector('span');

      // Als de checkbox checked is, up de like count, anders eentje eraf halen!
      if (this.checked) {
        likeCount.textContent = parseInt(likeCount.textContent) + 1;
      } else {
        likeCount.textContent = parseInt(likeCount.textContent) - 1;
      }

      // Update de Like count in de Directus API
      try {
        const response = await fetch('/like', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ like_id: serviceId })
        });
        if (!response.ok) {
          throw new Error('Failed to update likes count in Directus API');
        }
      } catch (error) {
        console.error('Error updating likes count:', error);
        // Hier kun je de user een error message geven.
      }
    });
  });
});