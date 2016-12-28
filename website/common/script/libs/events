function getNextEvent () {
  let nextEvent;
  let today = new Date().toISOString();
  for (let eventKey in common.content.events) {
    let event = common.content.events[eventKey];
    if (event.end > today) {
      if (!nextEvent || event.end > nextEvent.end) {
        event.key = eventKey;
        nextEvent = event;
      }
    }
  }
  nextEvent.specialItems = getSpecialItems();
  return nextEvent;
}
