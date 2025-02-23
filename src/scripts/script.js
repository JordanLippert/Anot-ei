document.addEventListener("DOMContentLoaded", function () {
  const token = document.cookie.split('; ').find(row => row.startsWith('token='));
  if (!token) {
    window.location.href = 'login.html';
    return;
  }

  var calendarEl = document.getElementById("calendar");
  //Configuração do calendário
  var calendar = new FullCalendar.Calendar(calendarEl, {
    buttonText: {
      today: "Mês Atual",
      month: "Mês",
      week: "Semana",
      day: "Dia",
    },
    headerToolbar: {
      left: "prev,next today", // botões de navegação a esquerda
      center: "title", // mês e ano no centro
      right: "dayGridMonth,timeGridWeek,timeGridDay", // botões de navegação a direita
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
    dateClick: function (info) {
      abrirModal(info);
    },
    eventClick: function (info) {
      abrirModalEditar(info);
    },
    eventDrop: function (info) {
      moverEvento(info);
    },
    events: "http://localhost:3000/events"
  });
  calendar.render();

  const modalEvent = document.getElementById('modal-event');
  const modalNote = document.getElementById('modal-note');

  document.getElementById('open-modal-note').addEventListener('click', function() {
    abrirModalAnotacao();
  });
  
  document.querySelector('.modal-close').addEventListener('click', function() {
    fecharModalAnotacao();
  });

  const abrirModalAnotacao = () => {
    if(modalNote.classList.contains('hidden')) {
      modalNote.classList.remove('hidden');

      modalNote.style.transition = 'opacity 300ms';

      setTimeout(() => modalNote.style.opacity = 1, 100);
    }
  }

  const fecharModalAnotacao = () => {
    if(!modalNote.classList.contains('hidden')) {
      modalNote.style.transition = 'opacity 300ms';

      setTimeout(() => modalNote.style.opacity = 0, 100);
      setTimeout(() => modalNote.classList.add('hidden'), 300);
    }
  }

  const abrirModal = (info) => {
    if(modalEvent.classList.contains('hidden')) {
      modalEvent.classList.remove('hidden');

      modalEvent.style.transition = 'opacity 300ms';

      setTimeout(() => modalEvent.style.opacity = 1, 100);
    }

    let title = prompt("Digite o título do evento:");
    if (title) {
      fetch('http://localhost:3000/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: title,
          start: info.dateStr,
          allDay: true
        })
      })
      .then(response => response.json())
      .then(event => {
        calendar.addEvent(event); // Adiciona o evento no calendário sem recarregar
      })
      .catch(error => console.error('Erro ao adicionar evento:', error));
    }

    document.querySelector('#start').value = info.dateStr + "08:00";
    document.querySelector('#end').value = info.dateStr + "18:00";
  }

  const abrirModalEditar = (info) => {
    if(modalEvent.classList.contains('hidden')) {
      modalEvent.classList.remove('hidden');

      modalEvent.style.transition = 'opacity 300ms';

      setTimeout(() => modalEvent.style.opacity = 1, 100);
    }

    let data_start =[
      info.event.start.toLocaleString().replace(',', '').split(' ')[0].split('/').reverse().join('-'),
      info.event.start.toLocaleString().replace(',', '').split(' ')[1]
    ].join(' ');

    let data_end =[
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
        info.event.remove(); // Remove o evento do calendário ao clicar nele
      })
      .catch(error => console.error('Erro ao deletar evento:', error));
    }
  }

  const moverEvento = (info) => {
    let id = info.event.id;
    let title = info.event.title;
    let start = info.event.start.toISOString();
    let end = info.event.end ? info.event.end.toISOString() : null;
    let allDay = info.event.allDay;
    let color = info.event.backgroundColor;

    let data = { id, title, color, start, end, allDay };

    fetch(`http://localhost:3000/events/${info.event.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(event => {
      console.log(event);
    })
    .catch(error => console.error('Erro ao atualizar evento:', error));
  }

  document.querySelector('.modal-close').addEventListener('click', () => fecharModal());
  
  modalEvent.addEventListener('click', function(event) {
    if(event.target === this) {
      fecharModal();
    }
  });

  document.addEventListener('keydown', function(event) {
    if(event.key === 'Escape') {
      fecharModal();
    }
  });

  const fecharModal = () => {
    if(!modalEvent.classList.contains('hidden')) {
      modalEvent.style.transition = 'opacity 300ms';

      setTimeout(() => modalEvent.style.opacity = 0, 100);
      setTimeout(() => modalEvent.classList.add('hidden'), 300);
    }
  }

  let form_add_event = document.querySelector('#form-add-event');

  form_add_event.addEventListener('submit', function(event) {
    event.preventDefault();

    let title = document.querySelector('#title').value;
    let start = document.querySelector('#start').value;
    let color = document.querySelector('#color').value; 

    if(title.value == '') {
      title.style.borderColor = 'red';
      title.focus();
      return false;
    }

    if(start.value == '') {
      start.style.borderColor = 'red';
      start.focus();
      return false;
    }

    this.submit();
  });

  document.querySelector('.btn-delete').addEventListener('click', function() {
    if(confirm('Tem certeza que deseja excluir este evento? E ação esta ação nao pode ser desfeita.')) {
      document.querySelector('#action').value = 'delete';
      form_add_event.submit();
      return true;
    }

    return false;
  });

  let form_add_note = document.querySelector('#form-add-note');

  form_add_note.addEventListener('submit', function(event) {
    event.preventDefault();

    let title = document.querySelector('#note-title').value;
    let content = document.querySelector('#note-content').value;

    if(title == '') {
      title.style.borderColor = 'red';
      title.focus();
      return false;
    }

    if(content == '') {
      content.style.borderColor = 'red';
      content.focus();
      return false;
    }

    let data = { title, content };

    let urlEncodedData = Object.keys(data)
      .map(key => encodeURIComponent(key) + '=' + encodeURIComponent(data[key]))
      .join('&');

    var ajax = new XMLHttpRequest();
    ajax.open('POST', 'http://localhost:3000/api/annotations', true);
    ajax.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    ajax.send(urlEncodedData);

    ajax.onreadystatechange = function() {
      if(ajax.readyState === 4 && ajax.status === 200) {
        var data = ajax.responseText;
        // console.log(data);
        fecharModalAnotacao();
      }
    }
  });
});