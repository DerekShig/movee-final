const textBox = document.querySelector('#filter-list');
const productContainer = document.querySelector('#product-container');

// This is to reset the input field when going back to the product page after clicking a product.
// Before it would retain it's value, causing minor UX issues.
window.addEventListener('pageshow', () => {
  textBox.value = '';
});

textBox.addEventListener('keyup', function(e) {
  for (let i = 0; i < productContainer.children.length; i++) {
    if (productContainer.children[i].children[0].getAttribute('data-productname').toLowerCase().includes(textBox.value.toLowerCase())) {
      productContainer.children[i].classList.remove('display-none')
    }
    else {
      productContainer.children[i].classList.add('display-none')      
    }
  }
});