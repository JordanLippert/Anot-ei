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
    },
    eventClick: function (info) {
      if (confirm("Deseja realmente deletar o evento?")) {
        fetch(`http://localhost:3000/events/${info.event.id}`, {
          method: 'DELETE'
        })
        .then(() => {
          info.event.remove(); // Remove o evento do calendário ao clicar nele
        })
        .catch(error => console.error('Erro ao deletar evento:', error));
      }
    },
    eventDrop: function (info) {
      fetch(`http://localhost:3000/events/${info.event.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: info.event.title,
          start: info.event.start.toISOString(),
          end: info.event.end ? info.event.end.toISOString() : null,
          allDay: info.event.allDay
        })
      })
      .then(response => response.json())
      .then(event => {
        console.log(event);
      })
      .catch(error => console.error('Erro ao atualizar evento:', error));
    },
    eventResize: function (info) {
      fetch(`http://localhost:3000/events/${info.event.id}`, {
          method: 'PUT',
          headers: {
              'Content-Type': 'application/json'
          },
          body: JSON.stringify({
              title: info.event.title,
              start: info.event.start.toISOString(),
              end: info.event.end ? info.event.end.toISOString() : null,
              allDay: info.event.allDay
          })
      })
      .then(response => response.json())
      .then(updatedEvent => {
          console.log("Evento atualizado com sucesso:", updatedEvent);
      })
      .catch(error => console.error("Erro ao redimensionar evento:", error));
    },
    events: "http://localhost:3000/events"
  });
  calendar.render();
});