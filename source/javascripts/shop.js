$(function() {

  /* Build new ShopifyBuy client
  ============================================================ */
  var client = ShopifyBuy.buildClient({
    apiKey: '019ef96b2d2d314ce01b60fec17b8e84', // Your SDK API/access token 
    domain: 'lunge-manufaktur.myshopify.com', // Your complete Shopify store domain
    appId: '6'
  });
  
  console.log(client);

  var product;
  var cart;
  var cartLineItemCount;
  
  //grab collection ID from div.collection#collection-id in HTML
  var collection = $('.gender-select').val();
  
  // check for existing cart in local storage, if one doesn't exist
  // create new cart object
  if(localStorage.getItem('lastCartId')) {
    client.fetchCart(localStorage.getItem('lastCartId')).then(function(remoteCart) {
      cart = remoteCart;
      cartLineItemCount = cart.lineItems.length;
      renderCartItems();
      updateCartTabButton();
    });
  } else {
    client.createCart().then(function (newCart) {
      cart = newCart;
      localStorage.setItem('lastCartId', cart.id);
      cartLineItemCount = 0;
      updateCartTabButton();
    });
  }

  var previousFocusItem;





  bindEventListeners();

  if (collection !== undefined) {
    getProducts(collection);
  }

  /* get products */
  function getProducts(collection) {
    client.fetchQueryProducts({collection_id: collection, sort_by: 'collection-default' }).then(function(products) {
      showSpinner();

      var product = products[0];
      var productSelectHTML = generateProductSelectors(products);
      var variantSelectHTML = generateVariantSelectors(product.variants);

      $('.product-select').html(productSelectHTML);
      $('.variant-select').html(variantSelectHTML);

      updateProductData();
      updateAddToCartButton();
    });
  }


  // get variants
  function getVariants(product) {
    client.fetchProduct(product).then(function(product) {
      showSpinner();

      var product = product;
      var variantSelectHTML = generateVariantSelectors(product.variants);

      $('.variant-select').html(variantSelectHTML)

      updateAddToCartButton();
      updateProductData();
    });
  }


  // update product image
  function updateProductImage(selectedVariant) {
    // var productImageURL = selectedVariant.image.src
    // $('.product__image').attr('src', productImageURL);

    var productImageURL = selectedVariant.image.src
    var productTitle = selectedVariant.productTitle
    $('.product__image-container').html('<img src="' + productImageURL + '" class="product__image" alt="' + productTitle + '">');
  }


  function showSpinner() {
    var spinnerHTML = '<div class="loader"></div>';
    $('.product__image-container').html(spinnerHTML);
  }



  // populate variant select box
  function generateVariantSelectors(variants) {
    var options;
    for (var i = 0; i < variants.length; i++) {
      var disabled = variants[i].available ? false : true
      options += '<option ' + (disabled ? 'disabled=disabled ' : '') + 'value = "' + variants[i].id + '">' + variants[i].title + '</option>';
    }

    return  '<select name = "variant-select" class = "variant-select">' + options + '</select>';
  }

  // populate product select box
  function generateProductSelectors(products) {
    var options;
    for (var i = 0; i < products.length; i++) {
      options += '<option value = "' + products[i].id + '">' + products[i].title + '</option>';
    }

    return  '<select class="product-select" name = "product-selection">' + options + '</select>';
  }



  function updateVariantPrice(selectedVariant) {
    var selectedVariant = selectedVariant;
    var formattedPrice = formatAsMoney(selectedVariant.price);
    
    $('.variant-price').text(formattedPrice);
  }


  // update add to cart button
  function updateAddToCartButton() {
    var product = $('.product-select').val();
    var variant = $('.variant-select').val();

    console.log('product: ' + product + ', variant: ' + variant);
    $('.buy-button').attr({'data-product-id': product, 'data-variant-id': variant})
  }



  // gender-select event listener
  $('.gender-select').on('change', function() {
    var collection = this.value;
    console.log('collection set to ' + collection);

    getProducts(collection);
  });


  // product-select event listener
  $('.product-select').on('change', function() {
    var product = this.value;
    console.log('product set to ' + product)

    getVariants(product);
  });


  // variant-select event listener
  $('.variant-select').on('change', function() {
    updateProductData();
  });



  function updateProductData() {
    var productID = $('.product-select').val();
    var variantID = $('.variant-select').val();

    client.fetchProduct(productID).then(function(product) {
      for (var i = 0; i < product.variants.length; i++) {
        if (product.variants[i].id == variantID) {
          var selectedVariant = product.variants[i];

          updateAddToCartButton();
          updateVariantPrice(selectedVariant);
          updateProductImage(selectedVariant);
        }
      }
    });
  }











    /* Bind Event Listeners
    ============================================================ */
  function bindEventListeners() {
    
    // cart close button listener 
    $('.cart .btn--close').on('click', closeCart);

    // click away listener to close cart 
    $(document).on('click', function(evt) {
      if((!$(evt.target).closest('.cart').length) && (!$(evt.target).closest('.js-prevent-cart-listener').length)) {
        closeCart();
      }
    });

    // escape key handler 
    var ESCAPE_KEYCODE = 27;
    $(document).on('keydown', function (evt) {
      if (evt.which === ESCAPE_KEYCODE) {
        if (previousFocusItem) {
          $(previousFocusItem).focus();
          previousFocusItem = ''
        }
        closeCart();
      }
    });

    // checkout button click listener 
    $('.button--checkout').on('click', function () {
      window.open(cart.checkoutUrl, '_checkout');
    });

    // buy button click listener 
    $('.buy-button').on('click', buyButtonClickHandler);

    // increment quantity click listener 
    $('.cart').on('click', '.quantity-increment', function () {
      var variantId = $(this).data('variant-id');
      incrementQuantity(variantId);
    });

    // decrement quantity click listener 
    $('.cart').on('click', '.quantity-decrement', function() {
      var variantId = $(this).data('variant-id');
      decrementQuantity(variantId);
    });

    // update quantity field listener 
    $('.cart').on('keyup', '.cart-item__quantity', debounce(fieldQuantityHandler, 250));

    // cart tab click listener 
    $('.cart__toggle').on('click', function() {
      console.log('cart should open');
      setPreviousFocusItem(this);
      openCart();
    });
    
    // open product modal
    $('.collection').on('click', '.image-overlay, .variant-image, .product-details', function(){
      console.log('clicked');
      $(this).parents('.product').find('.product-modal').show();
      if (!$('.product-modal-underlay').length) {
        $('body').append('<div class = "product-modal-underlay"></div>');
      }
    });
    
    // close product modal
    $('body').on('click', '.product-modal-underlay, .product-modal-close', hideModal);
    //$('body').on('click', '.product-modal-underlay', hideModal);
  }
  
  /* Attach and control listeners onto buy button
    ============================================================ */
  function buyButtonClickHandler(evt) {
    console.log('add to cart button clicked');
  
    evt.preventDefault();
    var productID = $(this).attr('data-product-id');
    var variantID = $(this).attr('data-variant-id'); 
    var cartLineItem = findCartItemByVariantId(variantID);
    var quantity = cartLineItem ? cartLineItem.quantity + 1 : 1;
    
    client.fetchProduct(productID).then(function(product) {
      for (var i = 0; i < product.variants.length; i++) {
        if (product.variants[i].id == variantID) {
          variantObject = product.variants[i];
          addOrUpdateVariant(cartLineItem, variantObject, quantity);
          setPreviousFocusItem(evt.target);
          $('#checkout').focus();
        }
      }
    });
  }

    /* Generate DOM elements for variant selectors
    ============================================================ */
  function generateSelectors(num, variants) {
    var options;

    for (var i = 0; i < variants.length; i++) {
      options += '<option value = "' + variants[i].id + '">' + variants[i].title + '</option>';
    }

    return  '<select name = "variant-selection" class = "product' + num + '">' + options + '</select>';
  }

    /* Generate DOM elements for product selectors
    ============================================================ */
  function generateProductSelectors(products) {
    var options;

    for (var i = 0; i < products.length; i++) {
      options += '<option value = "' + products[i].id + '">' + products[i].title + '</option>';
    }

    return  '<select class="product-select" name = "product-selection">' + options + '</select>';
  }

    /* Variant option change handler
    ============================================================ */
  function attachOnVariantSelectListeners() {
    $('.collection').on('change', 'select[name=variant-selection]', function(event) {
      var element = $(this);
      var num = element.attr('class').replace("product", "");
      var productID = element.closest('.product').attr('data-product-id');
      var variantID = element.val();
      var variantName = element.find('option:selected').text();
      
      $('.add-button[data-product-id="'+ productID +'"]').attr('data-variant-id', variantID);
      
      client.fetchProduct(productID).then(function(product) {
        for (var i = 0; i < product.variants.length; i++) {
          if (product.variants[i].id == variantID) {
            var selectedVariant = product.variants[i];
            updateVariantImage(num, selectedVariant.image);
            updateVariantTitle(num, selectedVariant);
            updateVariantPrice(num, selectedVariant);
          }
        }
      });
    });
  }
  

  
  
  /*************************************************************/
  
  

  /* Update product title
  ============================================================ */
  function updateProductTitle(i, title) {
    $('#buy-button-'+i).find('.product-title').text(title);
  }

  /* Update product description
  ============================================================ */
  function updateProductDescription(i, description) {
    $('#buy-button-'+i).find('.product-description').html(description);
  }

  /* Update product image based on selected variant
  ============================================================ */
  function updateVariantImage(i, image) {
    var src = (image) ? image.src : ShopifyBuy.NO_IMAGE_URI;
    $('#buy-button-'+i).find('.variant-image').attr('src', src);
  }

  /* Update product variant title based on selected variant
  ============================================================ */
  function updateVariantTitle(i, variant) {
    $('#buy-button-'+i).find('.variant-title').text(variant.title);
  }

  /* Update product variant price based on selected variant
  ============================================================ */
  // function updateVariantPrice(i, variant) {
  //   $('#buy-button-'+i).find('.variant-price').text('$' + variant.price);
  // }

  /* Update product variant selectors 
  ============================================================ */
  function updateVariantSelectors(i, variantSelectors) {
    $('#buy-button-'+i).find('.variant-selectors').html(variantSelectors);
  }

  function updateBuyButton(productID, variant) {
    console.log(productID);
    console.log(variant);
    $('.add-button[data-product-id="'+ productID +'"]').data('variant-id', variant.id);
  }
  

  
  
  /*************************************************************/
  
  
  
  
  /* Decrease quantity amount by 1
  ============================================================ */
  function decrementQuantity(variantId) {
    updateQuantity(function(quantity) {
      return quantity - 1;
    }, variantId);
  }

  /* Increase quantity amount by 1
  ============================================================ */
  function incrementQuantity(variantId) {
    updateQuantity(function(quantity) {
      return quantity + 1;
    }, variantId);
  }

  /* Update product variant quantity in cart
  ============================================================ */
  function updateQuantity(fn, variantId) {
    var quantity;
    var cartLineItem = findCartItemByVariantId(variantId);
    if (cartLineItem) {
      quantity = fn(cartLineItem.quantity);
      updateVariantInCart(cartLineItem, quantity);
    }
  }

  /* Update product variant quantity in cart through input field
  ============================================================ */
  function fieldQuantityHandler(evt) {
    var variantId = parseInt($(this).closest('.cart-item').attr('data-variant-id'), 10);
    var cartLineItem = findCartItemByVariantId(variantId);
    var quantity = evt.target.value;
    if (cartLineItem) {
      updateVariantInCart(cartLineItem, quantity);
    }
  }

  /* Debounce taken from _.js
  ============================================================ */
  function debounce(func, wait, immediate) {
    var timeout;
    return function() {
      var context = this, args = arguments;
      var later = function() {
        timeout = null;
        if (!immediate) func.apply(context, args);
      };
      var callNow = immediate && !timeout;
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
      if (callNow) func.apply(context, args);
    }
  }


  
  
  /*************************************************************/



  /* Hide Modal 
  ============================================================ */
  function hideModal() {
    $('.product-modal').hide();
    $('.product-modal-underlay').remove();
  }
  
  
  /* Open Cart
  ============================================================ */
  function openCart() {
    console.log('cartOpen trigerred');
    $('body').removeClass('offcanvas');
    $('.cart').addClass('js-active');
  }

  /* Close Cart
  ============================================================ */
  function closeCart() {
    console.log('closeCart trigerred');
    $('.cart').removeClass('js-active');
    $('.overlay').removeClass('js-active');
  }

  /* Find Cart Line Item By Variant Id
  ============================================================ */
  function findCartItemByVariantId(variantId) {
    return cart.lineItems.filter(function(item) {
      return (item.variant_id == variantId);
    })[0];
  }

    /* Determine action for variant adding/updating/removing
    ============================================================ */
  function addOrUpdateVariant(cartLineItem, variantObject, quantity) {
    openCart();
    var variantObjectID = variantObject.id;
    if (cartLineItem) {
      updateVariantInCart(cartLineItem, quantity);
    } else {
      addVariantToCart(variantObject, quantity);
    }
    updateCartTabButton();
  }

    /* Update details for item already in cart. Remove if necessary
    ============================================================ */
  function updateVariantInCart(cartLineItem, quantity) {
    var variantId = cartLineItem.variant_id;
    var cartLength = cart.lineItems.length;
    cart.updateLineItem(cartLineItem.id, quantity).then(function(updatedCart) {
      var $cartItem = $('.cart').find('.cart-item[data-variant-id="' + variantId + '"]');
      
      if (updatedCart.lineItems.length >= cartLength) {
          $cartItem.find('.cart-item__quantity').val(cartLineItem.quantity);
          $cartItem.find('.cart-item__price').text(formatAsMoney(cartLineItem.line_price));
      } else {
        $cartItem.addClass('js-hidden').bind('transitionend webkitTransitionEnd oTransitionEnd MSTransitionEnd', function() {
           $cartItem.remove();
        });
      }

      updateCartTabButton();
      updateTotalCartPricing();
      
      if (updatedCart.lineItems.length < 1) {
        closeCart();
      }
    }).catch(function (errors) {
      console.log('Fail');
      console.error(errors);
    });
  }

    /* Add 'quantity' amount of product 'variant' to cart
    ============================================================ */
  function addVariantToCart(variantObject, quantity) {
    openCart();
    var lineItems = $('<div class = "lineItems"></div>');
    cart.addVariants({ variant: variantObject, quantity: quantity }).then(function(cart) {
      for (var i = 0; i < cart.lineItems.length; i++) {
        lineItems.append(renderCartItem(cart.lineItems[i]));
      }

      var $cartItemContainer = $('.cart-item-container');
      $cartItemContainer.empty();
      $cartItemContainer.append(lineItems);
    }).catch(function (errors) {
      console.log('Fail');
      console.error(errors);
    });

    updateTotalCartPricing();
    updateCartTabButton();
  }
  
  /* Update cart tab button
  ============================================================ */
  function updateCartTabButton() {
    if (cart.lineItems.length > 0) {
      $('.cart__toggle .btn__counter').html('Warenkorb (' + cart.lineItemCount + ')');
      $('.cart__toggle').addClass('js-active');
    } else {
      $('.cart__toggle').removeClass('js-active');
      $('.cart').removeClass('js-active');
    }
  }

    /* Return required markup for single item rendering
    ============================================================ */
  function renderCartItem(lineItem) {
    console.log(lineItem);
    var lineItemEmptyTemplate = $('#CartItemTemplate').html();
    var $lineItemTemplate = $(lineItemEmptyTemplate);
    var itemImage = lineItem.image.src;
    
    $lineItemTemplate.attr('data-variant-id', lineItem.variant_id);
    $lineItemTemplate.addClass('js-hidden');
    $lineItemTemplate.find('.cart-item__img').css('background-image', 'url(' + itemImage + ')');
    $lineItemTemplate.find('.cart-item__title').text(lineItem.title);
    
    if (lineItem.variant_title != 'Default Title') {
      $lineItemTemplate.find('.cart-item__variant-title').text(lineItem.variant_title);
    }

    $lineItemTemplate.find('.cart-item__price').text(formatAsMoney(lineItem.line_price));
    $lineItemTemplate.find('.cart-item__quantity').attr('value', lineItem.quantity);
    $lineItemTemplate.find('.quantity-decrement').attr('data-variant-id', lineItem.variant_id);
    $lineItemTemplate.find('.quantity-increment').attr('data-variant-id', lineItem.variant_id);
    $lineItemTemplate.removeClass('js-hidden');

    return $lineItemTemplate;
  }

  /* Render the line items currently in the cart
    ============================================================ */
  function renderCartItems() {
    var $cartItemContainer = $('.cart-item-container');
    $cartItemContainer.empty();
    
    var lineItemEmptyTemplate = $('#CartItemTemplate').html();
    var $cartLineItems = cart.lineItems.map(function (lineItem, index) {
      return renderCartItem(lineItem);
    });
    
    $cartItemContainer.append($cartLineItems);

    setTimeout(function() {
      $cartItemContainer.find('.js-hidden').removeClass('js-hidden');
    }, 0);
    updateTotalCartPricing();
  }

  /* Update Total Cart Pricing
  ============================================================ */
  function updateTotalCartPricing() {
    $('.cart .pricing').text(formatAsMoney(cart.subtotal));
  }

  /* Format amount as currency
  ============================================================ */
  function formatAsMoney(amount, currency, thousandSeparator, decimalSeparator, localeDecimalSeparator) {
    currency = currency || '€ ';
    thousandSeparator = thousandSeparator || '.';
    decimalSeparator = decimalSeparator || ',';
    localeDecimalSeparator = localeDecimalSeparator || '.';
    var regex = new RegExp('(\\d)(?=(\\d{3})+\\.)', 'g');

    return currency + parseFloat(amount, 10).toFixed(2)
      .replace(localeDecimalSeparator, decimalSeparator)
      .replace(regex, '$1' + thousandSeparator)
    .toString();
  }

  /* Set previously focused item for escape handler
  ============================================================ */
  function setPreviousFocusItem(item) {
    previousFocusItem = item;
  }

});