
$( document ).ready(function() {
  $("button[popover]").each(function(){
    var text = $(this).attr('popover');
    //not everything has a popover-title. If it does we want that title for the aria-label
    if ($(this).attr('popover-title') !== undefined){
      var title = $(this).attr('popover-title');
      $(this).attr('aria-label', title);
    } else {
      //fall back to just using the popover text if no title is present
      $(this).attr('aria-label', text);
    }
  });
  //turns out some of the popovers are inside divs which hold the button
  $("div[popover]").each(function(){
    var label = "";
    if ($(this).attr('popover-title') !== undefined){
      label = $(this).attr('popover-title');
    } else {
      label = $(this).attr('popover');
    }
    $(this).find("button").attr('aria-label', label);
  })
});