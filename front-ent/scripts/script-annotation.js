document.addEventListener("DOMContentLoaded", async function () {
  //const tokenCookie = document.cookie.split('; ').find(row => row.startsWith('token='));
  //if (!tokenCookie) {
  //  window.location.href = 'login.html';
  //  return;
  //}
  //const token = tokenCookie.split('=')[1];

  // Função para buscar anotações do back-end
  async function fetchAnnotations() {
    const response = await fetch('http://localhost:3000/annotations', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    const annotations = await response.json();
    return annotations.map(annotation => ({
      id: annotation.id,
      title: annotation.title,
      content: annotation.content
    }));
  }

  // Função para renderizar anotações na página
  function renderAnnotations(annotations) {
    const annotationsContainer = document.querySelector('.annotations');
    annotationsContainer.innerHTML = ''; // Limpa as anotações existentes

    annotations.forEach(annotation => {
      const annotationDiv = document.createElement('div');
      annotationDiv.classList.add('annotation');
      annotationDiv.innerHTML = `
        <h3>${annotation.title}</h3>
        <p>${annotation.content}</p>
      `;
      annotationsContainer.appendChild(annotationDiv);
    });
  }

  // Buscar e renderizar anotações
  const annotations = await fetchAnnotations();
  renderAnnotations(annotations);

  // Form Handlers
  const formAddNote = document.querySelector('#form-add-note');
  formAddNote.addEventListener('submit', function(event) {
    event.preventDefault();

    const title = document.querySelector('#note-title').value;
    const content = document.querySelector('#note-content').value;

    const noteData = { title, content };

    fetch('http://localhost:3000/annotations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(noteData)
    })
    .then(response => response.json())
    .then(data => {
      console.log(data);
      fecharModalAnotacao();
      fetchAnnotations().then(renderAnnotations); // Atualiza as anotações após adicionar uma nova
    })
    .catch(error => console.error('Error:', error));
  });

  // Modal Functions
  const modalNote = document.getElementById('modal-note');
  function abrirModalAnotacao() {
    if(modalNote.classList.contains('hidden')) {
      modalNote.classList.remove('hidden');
      modalNote.style.transition = 'opacity 300ms';
      setTimeout(() => modalNote.style.opacity = 1, 100);
    }
  }

  function fecharModalAnotacao() {
    if(!modalNote.classList.contains('hidden')) {
      modalNote.style.transition = 'opacity 300ms';
      setTimeout(() => modalNote.style.opacity = 0, 100);
      setTimeout(() => modalNote.classList.add('hidden'), 300);
    }
  }

  document.getElementById('open-modal-note').addEventListener('click', abrirModalAnotacao);
  
  document.querySelectorAll('.modal-close').forEach(closeBtn => {
    closeBtn.addEventListener('click', (e) => {
      const modal = e.target.closest('.modal-opened');
      if (modal.id === 'modal-note') {
        fecharModalAnotacao();
      }
    });
  });
  
  document.addEventListener('click', function(event) {
    if(event.target === modalNote) {
      fecharModalAnotacao();
    }
  });

  document.addEventListener('keydown', function(event) {
    if(event.key === 'Escape') {
      if(!modalNote.classList.contains('hidden')) {
        fecharModalAnotacao();
      }
    }
  });
});