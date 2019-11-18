// POLYFILLS
// array.prototype.find()
if (!Array.prototype.find) {
  Object.defineProperty(Array.prototype, 'find', {
    value: function(predicate) {
     // 1. Let O be ? ToObject(this value).
      if (this == null) {
        throw new TypeError('"this" is null or not defined');
      }

      var o = Object(this);

      // 2. Let len be ? ToLength(? Get(O, "length")).
      var len = o.length >>> 0;

      // 3. If IsCallable(predicate) is false, throw a TypeError exception.
      if (typeof predicate !== 'function') {
        throw new TypeError('predicate must be a function');
      }

      // 4. If thisArg was supplied, let T be thisArg; else let T be undefined.
      var thisArg = arguments[1];

      // 5. Let k be 0.
      var k = 0;

      // 6. Repeat, while k < len
      while (k < len) {
        // a. Let Pk be ! ToString(k).
        // b. Let kValue be ? Get(O, Pk).
        // c. Let testResult be ToBoolean(? Call(predicate, T, « kValue, k, O »)).
        // d. If testResult is true, return kValue.
        var kValue = o[k];
        if (predicate.call(thisArg, kValue, k, o)) {
          return kValue;
        }
        // e. Increase k by 1.
        k++;
      }

      // 7. Return undefined.
      return undefined;
    },
    configurable: true,
    writable: true
  });
}



// OFFCANVAS-NAV
$("#offcanvas-top-open, #offcanvas-top-close").click(function() {
    $("body").toggleClass("offcanvas")
});



// TABS
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



// CART
$("[data-action='toggle-cart']").on("click", function() {
  $("[data-embed_type='cart_content']").toggleClass("js-active");
});