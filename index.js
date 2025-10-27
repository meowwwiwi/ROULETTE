window.addEventListener("load", () => {
  document.querySelectorAll('.btn-ver').forEach(btn => {
    btn.addEventListener('click', () => {
      const input = document.getElementById(btn.dataset.target);
      if(input.type === 'password') {
        input.type = 'text';
        btn.textContent = 'Ocultar';
      } else {
        input.type = 'password';
        btn.textContent = 'Mostrar';
      }
    });
  });
});