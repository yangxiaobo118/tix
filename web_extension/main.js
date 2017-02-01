(function () {
  var KEY_CODE = {
    F1: 112,
    F2: 113,
    F3: 114,
    F4: 115
  };

  var tickets = document
    .getElementById('ticketPriceList')  // table#ticketPriceList
    .children[1]                        // tbody
    .children[0]                        // tr.gridc
    .children[1]                        // td
    .children[0];                       // select

  document
    .getElementById('TicketForm_verifyCode')  // input#TicketForm_verifyCode
    .focus();

  document.addEventListener('keyup', function (e) {
    var k = e.keyCode;
    if (KEY_CODE.F1 <= k && k <= KEY_CODE.F4) {
      var n = k + 1 - KEY_CODE.F1;
      console.log('select ' + n);
      tickets.selectedIndex = n;
    }
  });

  // default = 4 tickets
  tickets.selectedIndex = 4;
})();
