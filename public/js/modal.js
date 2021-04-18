var exampleModal = document.getElementById('exampleModal')
exampleModal.addEventListener('show.bs.modal', function (event) {
  var button = event.relatedTarget
  var id = button.getAttribute('data-bs-value');
  var deleteButton = exampleModal.querySelector('#delete-product');
  deleteButton.action = `/user/delete/${id}?_method=DELETE`
})