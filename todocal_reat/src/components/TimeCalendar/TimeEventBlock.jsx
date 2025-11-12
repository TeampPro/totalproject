import moment from "moment";

function TimeEventBlock({ event }) {
  const start = moment(event.promiseDate);
  const end = start.clone().add(1, "hour"); // 기본적으로 1시간 블록으로 표시

  const startHour = start.hour() + start.minute() / 60;
  const endHour = end.hour() + end.minute() / 60;

  const top = `${(startHour / 24) * 100}%`;
  const height = `${((endHour - startHour) / 24) * 100}%`;

  return (
    <div
      className="time-event-block"
      style={{ top, height }}
      title={`${event.title} (${start.format("HH:mm")})`}
    >
      <div className="event-title">{event.title}</div>
      <div className="event-time">{start.format("HH:mm")}</div>
    </div>
  );
}

export default TimeEventBlock;
