document.addEventListener("DOMContentLoaded", function () {
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

  const modal = document.querySelector('.modal-opened');
  // const modalAnotacao = document.querySelector('.modal-anotacao-opened');
  // const buttonAnotacao = document.querySelector('.button-anotacao');

  //buttonAnotacao.addEventListener('click', () => {
  //  if (modalAnotacao.classList.contains('hidden')) {
  //    modalAnotacao.classList.remove('hidden');
  //    modalAnotacao.style.transition = 'opacity 300ms';
  //    setTimeout(() => modalAnotacao.style.opacity = 1, 100);
 //   }
  //});

  const abrirModal = (info) => {
    if(modal.classList.contains('hidden')) {
      modal.classList.remove('hidden');

      modal.style.transition = 'opacity 300ms';

      setTimeout(() => modal.style.opacity = 1, 100);
    }

    document.querySelector('#start').value = info.dateStr + "08:00";
    document.querySelector('#end').value = info.dateStr + "18:00";
  }

  const abrirModalEditar = (info) => {
    if(modal.classList.contains('hidden')) {
      modal.classList.remove('hidden');

      modal.style.transition = 'opacity 300ms';

      setTimeout(() => modal.style.opacity = 1, 100);
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
  
  }

  const moverEvento = (info) => {
    let id = info.event.id;
    let title = info.event.title;
    let start = info.event.startStr;
    let end = info.event.endStr ? info.event.endStr : null;
    let color = info.event.backgroundColor;

    let data = { id, title, color , start, end };

    let urlEncodedData = Object.keys(data)
      .map(key =>encodeURIComponent(key) + '=' + encodeURIComponent(data[key]))
      .join('&');

    var ajax = new XMLHttpRequest();
    ajax.open('POST', 'http://localhost:3000/events', true);
    ajax.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    ajax.send(urlEncodedData);

    ajax.onreadystatechange = function() {
      if(ajax.readyState === 4 && ajax.status === 200) {
        var data = ajax.responseText;
        // console.log(data);
      }
    }
  }

  document.querySelector('.modal-close').addEventListener('click', () => fecharModal());
  
  modal.addEventListener('click', function(event) {
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
    if(!modal.classList.contains('hidden')) {
      modal.style.transition = 'opacity 300ms';

      setTimeout(() => modal.style.opacity = 0, 100);
      setTimeout(() => modal.classList.add('hidden'), 300);
    }
  }

  let form_add_event = document.querySelector('#form-add-event');

  form_add_event.addEventListener('submit', function(event) {
    event.preventDefault();

    let title = document.querySelector('#title').value;
    let start = document.querySelector('#start').value;

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
});