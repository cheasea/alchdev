var scroll_up_btn = $("#scroll_up_button");

var scrolled = 0;

$(window).scroll(function() {
  if ($(window).scrollTop() > 300) {
    scroll_up_btn.addClass("show-btn");
  } else {
    scroll_up_btn.removeClass("show-btn");
  }
});

scroll_up_btn.click(function(e) {
  e.preventDefault();

  if ($(window).scrollTop() <= 300) {
    $("html, body").animate({ scrollTop: scrolled }, "300");
    scrolled = 0;
  } else {
    scrolled = $(window).scrollTop();
    $("html, body").animate({ scrollTop: 0 }, "300");
  }
});
