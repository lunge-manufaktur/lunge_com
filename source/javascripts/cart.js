$("[data-action='toggle-cart-content']").on("click", function() {
  console.log("Cart toggled");
  $("[data-embed_type='cart_content']").toggleClass("active");
});