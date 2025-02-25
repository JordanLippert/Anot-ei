document.addEventListener("DOMContentLoaded", function () {
  const token = document.cookie.split('; ').find(row => row.startsWith('token='));
  if (!token) {
    window.location.href = 'login.html';
    return;
  }

  // DOM Elements
  const calendarEl = document.getElementById("calendar");
  const modalEvent = document.getElementById('modal-event');
  const modalNote = document.getElementById('modal-note');
  const formAddEvent = document.querySelector('#form-add-event');
  const formAddNote = document.querySelector('#form-add-note');
  const btnDelete = document.querySelector('.btn-delete');

  // Calendar Configuration
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
    events: "http://localhost:3000/events"
  });
  
  calendar.render();

  // Event Listeners
  document.getElementById('open-modal-note').addEventListener('click', abrirModalAnotacao);
  
  document.querySelectorAll('.modal-close').forEach(closeBtn => {
    closeBtn.addEventListener('click', (e) => {
      const modal = e.target.closest('.modal-opened');
      if (modal.id === 'modal-event') {
        fecharModal();
      } else if (modal.id === 'modal-note') {
        fecharModalAnotacao();
      }
    });
  });
  
  document.addEventListener('click', function(event) {
    if(event.target === modalEvent) {
      fecharModal();
    }
    else if(event.target === modalNote) {
      fecharModalAnotacao();
    }
  });

  document.addEventListener('keydown', function(event) {
    if(event.key === 'Escape') {
      if(!modalEvent.classList.contains('hidden')) {
        fecharModal();
      } else if(!modalNote.classList.contains('hidden')) {
        fecharModalAnotacao();
      }
    }
  });

  btnDelete.addEventListener('click', function() {
    if(confirm('Tem certeza que deseja excluir este evento? E ação esta ação nao pode ser desfeita.')) {
      document.querySelector('#action').value = 'delete';
      formAddEvent.submit();
      return true;
    }
    return false;
  });

  // Form Handlers
  formAddEvent.addEventListener('submit', function(event) {
    event.preventDefault();

    const title = document.querySelector('#title');
    const start = document.querySelector('#start');
    const color = document.querySelector('#color').value;

    if(title.value === '') {
      title.style.borderColor = 'red';
      title.focus();
      return false;
    }

    if(start.value === '') {
      start.style.borderColor = 'red';
      start.focus();
      return false;
    }

    this.submit();
  });

  formAddNote.addEventListener('submit', function(event) {
    event.preventDefault();

    const title = document.querySelector('#note-title');
    const content = document.querySelector('#note-content');

    if(title.value === '') {
      title.style.borderColor = 'red';
      title.focus();
      return false;
    }

    if(content.value === '') {
      content.style.borderColor = 'red';
      content.focus();
      return false;
    }

    const data = { 
      title: title.value, 
      content: content.value 
    };

    const urlEncodedData = Object.keys(data)
      .map(key => encodeURIComponent(key) + '=' + encodeURIComponent(data[key]))
      .join('&');

    const ajax = new XMLHttpRequest();
    ajax.open('POST', 'http://localhost:3000/api/annotations', true);
    ajax.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    ajax.send(urlEncodedData);

    ajax.onreadystatechange = function() {
      if(ajax.readyState === 4 && ajax.status === 200) {
        fecharModalAnotacao();
      }
    }
  });

  // Modal Functions
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

  function abrirModal(info) {
    if(modalEvent.classList.contains('hidden')) {
      modalEvent.classList.remove('hidden');
      modalEvent.style.transition = 'opacity 300ms';
      setTimeout(() => modalEvent.style.opacity = 1, 100);
    }

    document.querySelector('#start').value = info.dateStr + "08:00";
    document.querySelector('#end').value = info.dateStr + "18:00";
  }

  function abrirModalEditar(info) {
    if(modalEvent.classList.contains('hidden')) {
      modalEvent.classList.remove('hidden');
      modalEvent.style.transition = 'opacity 300ms';
      setTimeout(() => modalEvent.style.opacity = 1, 100);
    }

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
        method: 'DELETE'
      })
      .then(() => {
        info.event.remove();
      })
      .catch(error => console.error('Erro ao deletar evento:', error));
    }
  }

  function fecharModal() {
    if(!modalEvent.classList.contains('hidden')) {
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