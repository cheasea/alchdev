interact('.element').draggable({
  listeners: {
    move (event) {
      let x = +event.target.getAttribute('x');
      let y = +event.target.getAttribute('y');

      let newPosition = {
        x: x + event.dx,
        y: y + event.dy
      };

      event.target.style.transform =
        `translate(${newPosition.x}px, ${newPosition.y}px)`;

      event.target.setAttribute('x', newPosition.x);
      event.target.setAttribute('y', newPosition.y);
    }
  }
});

interact('.element').dropzone({
  accept: '.element',
  overlap: 0.25,
  ondrop: function(event) {
    let firstElement = event.target;
    let secondElement = event.relatedTarget;

    onDrop(firstElement, secondElement);
  }
});
