$('.tab-title').on('click', function(e) {
  e.preventDefault();

  console.log("tab triggered");

  var target = $(this).children('a').attr('href');
  
  // add active class to tab titles
  $('.tab-title').removeClass("tab-title--active");
  $(this).addClass("tab-title--active");

  // switch to correct tab
  $('.tab').removeClass("tab--active");
  $('.tab[data-tab="' + target +'"]').addClass("tab--active");
});