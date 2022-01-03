$('.btn-hamburger').click(() => {
    $('.nav').slideToggle('fast');    
})


$('.fa-shopping-cart').click(() => {
    $('.cart-section').addClass('cart-section-active');
})

$('.cart__icon').click(() => {
    $('.cart-section').removeClass('cart-section-active');
})

