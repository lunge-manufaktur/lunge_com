$("#contact-form").submit(function(e) {
  e.preventDefault();

  var $form = $(this);
  $.post($form.attr("action"), $form.serialize()).then(function() {
    alert("Danke! Wir haben Ihre Nachricht erhalten.");
    $("#submit-button").replaceWith("<p>Vielen Dank. Wir haben Ihre Nachricht erhalten.</p>");
  });
});