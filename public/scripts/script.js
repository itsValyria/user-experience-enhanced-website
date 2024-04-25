document.addEventListener('DOMContentLoaded', function() {
  const likeCheckboxes = document.querySelectorAll('.heart-checkbox input[type="checkbox"]');

  // Voor elke checkbox, add eventListener change, en als hij gechanged is...
  likeCheckboxes.forEach(function(checkbox) {
    checkbox.addEventListener('change', async function() {
      const serviceId = this.value;
      const likeCount = this.parentElement.querySelector('span');
      const heartIcon = this.parentElement.querySelector('i.fas.fa-heart');

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
        // Verander naar een broken heart
        heartIcon.className = 'fas fa-heart-broken heart-checkbox-error';
        // Disable de checkbox tot een refresh
        this.disabled = true;
        // Geef een pop-up met een foutmelding en instructie hoe nu verder
        alert('Oeps! Er is iets mis gegaan bij het liken van dit initiatief. Herlaad de pagina en probeer het opnieuw.');
      }
    });
  })});