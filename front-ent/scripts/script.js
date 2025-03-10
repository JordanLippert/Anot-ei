document.addEventListener("DOMContentLoaded", async function () {
  // Caso seja necessário utilizar autenticação, descomente e ajuste:
  // const tokenCookie = document.cookie.split('; ').find(row => row.startsWith('token='));
  // if (!tokenCookie) {
  //   window.location.href = 'login.html';
  //   return;
  // }
  // const token = tokenCookie.split('=')[1];

  // DOM Elements para eventos
  const calendarEl = document.getElementById("calendar");
  const modalEvent = document.getElementById('modal-event');
  const formAddEvent = document.querySelector('#form-add-event');
  const btnDelete = document.querySelector('.btn-delete');

  // Configuração do calendário (FullCalendar)
  const calendar = new FullCalendar.Calendar(calendarEl, {
    buttonText: {
      today: "Mês Atual",
      month: "Mês",
      week: "Semana",
      day: "Dia",
    },
    headerToolbar: {
      left: "prev,next today",
      center: "title",
      right: "dayGridMonth,timeGridWeek,timeGridDay",
    },
    allDayText: "Dia todo",
    datesSet: function (info) {
      const todayButton = document.querySelector('.fc-today-button');
      if (info.view.type === 'timeGridWeek') {
        todayButton.innerText = 'Semana atual';
      } else if (info.view.type === 'timeGridDay') {
        todayButton.innerText = 'Dia atual';
      } else {
        todayButton.innerText = 'Mês atual';
      }
    },
    initialView: "dayGridMonth",
    locale: "pt-br",
    navLinks: true,
    selectable: true,
    selectMirror: true,
    editable: true,
    dayMaxEvents: true,
    dateClick: abrirModal,
    eventClick: abrirModalEditar,
    eventDrop: moverEvento,
    // Para utilizar os eventos buscados do backend, implemente a função fetchEvents e descomente:
    // events: await fetchEvents(),
  });

  calendar.render();

  // Event Listeners para os modais de evento
  document.querySelectorAll('.modal-close').forEach(closeBtn => {
    closeBtn.addEventListener('click', (e) => {
      const modal = e.target.closest('.modal-opened');
      if (modal.id === 'modal-event') {
        fecharModal();
      }
    });
  });
  
  document.addEventListener('click', function(event) {
    if (event.target === modalEvent) {
      fecharModal();
    }
  });

  document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape' && !modalEvent.classList.contains('hidden')) {
      fecharModal();
    }
  });

  btnDelete.addEventListener('click', function() {
    if (confirm('Tem certeza que deseja excluir este evento? Essa ação não pode ser desfeita.')) {
      document.querySelector('#action').value = 'delete';
      formAddEvent.submit();
      return true;
    }
    return false;
  });

  // Form Handler para envio de evento
  formAddEvent.addEventListener('submit', function(event) {
    event.preventDefault();

    const title = document.querySelector('#title').value;
    const start = document.querySelector('#start').value;
    const color = document.querySelector('#color').value;
    const eventData = { title, start, color };

    fetch('http://localhost:3000/events', {
      method: 'POST',
      headers: {
        // Se usar autenticação, descomente:
        // 'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(eventData)
    })
    .then(response => response.json())
    .then(data => {
      console.log(data);
      fecharModal();
      // Opcional: atualizar o calendário com o novo evento
    })
    .catch(error => console.error('Error:', error));
  });

  // Funções para manipulação do modal de eventos

  function abrirModal(info) {
    if (modalEvent.classList.contains('hidden')) {
      modalEvent.classList.remove('hidden');
      modalEvent.style.transition = 'opacity 300ms';
      setTimeout(() => modalEvent.style.opacity = 1, 100);
    }
    // Preenche os campos do modal para criação de evento
    document.querySelector('#start').value = info.dateStr + "08:00";
    document.querySelector('#end').value = info.dateStr + "18:00";
  }

  function abrirModalEditar(info) {
    if (modalEvent.classList.contains('hidden')) {
      modalEvent.classList.remove('hidden');
      modalEvent.style.transition = 'opacity 300ms';
      setTimeout(() => modalEvent.style.opacity = 1, 100);
    }
    
    // Formata datas (caso necessário)
    let data_start = [
      info.event.start.toLocaleString().replace(',', '').split(' ')[0].split('/').reverse().join('-'),
      info.event.start.toLocaleString().replace(',', '').split(' ')[1]
    ].join(' ');
    
    let data_end = [
      info.event.end.toLocaleString().replace(',', '').split(' ')[0].split('/').reverse().join('-'),
      info.event.end.toLocaleString().replace(',', '').split(' ')[1]
    ].join(' ');

    document.querySelector('.modal-title h3').innerHTML = 'Editar Evento';
    document.querySelector('#id').value = info.event.id;
    document.querySelector('#title').value = info.event.title;
    document.querySelector('#color').value = info.event.backgroundColor; 
    document.querySelector('#start').value = info.event.data_start;
    document.querySelector('#end').value = info.event.data_end;
    document.querySelector('.btn-delete').classList.remove('hidden');

    if (confirm("Deseja realmente deletar o evento?")) {
      fetch(`http://localhost:3000/events/${info.event.id}`, {
        method: 'DELETE',
        headers: {
          // 'Authorization': `Bearer ${token}`
        }
      })
      .then(() => {
        info.event.remove();
      })
      .catch(error => console.error('Erro ao deletar evento:', error));
    }
  }

  function fecharModal() {
    if (!modalEvent.classList.contains('hidden')) {
      modalEvent.style.transition = 'opacity 300ms';
      setTimeout(() => modalEvent.style.opacity = 0, 100);
      setTimeout(() => modalEvent.classList.add('hidden'), 300);
    }
  }

  function moverEvento(info) {
    const eventData = {
      id: info.event.id,
      title: info.event.title,
      color: info.event.backgroundColor,
      start: info.event.start.toISOString(),
      end: info.event.end ? info.event.end.toISOString() : null,
      allDay: info.event.allDay
    };

    fetch(`http://localhost:3000/events/${info.event.id}`, {
      method: 'PUT',
      headers: {
        // 'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(eventData)
    })
    .then(response => response.json())
    .then(event => {
      console.log(event);
    })
    .catch(error => console.error('Erro ao atualizar evento:', error));
  }
});
