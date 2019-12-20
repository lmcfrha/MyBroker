function  initializeWidgets() {

<!-- When the sum of targets > 100, pop up the alert dialog jQueryUI -->
  $("#over100").dialog({ 
     autoOpen: false,   
     classes: {
        "ui-dialog": "error"
     } 
     });

  
<!-- The dialog to add cash to a profile in an account -->  
     var form,
 
      // From https://jqueryui.com/dialog/#modal-form
     deposit = $( "#deposit" ),
     d = $("#dialog-form-add"),
     allFields = $( [] ).add( deposit ),
     tips = $( ".validateTips" );
 
     function updateTips( t ) {
       tips
         .text( t )
         .addClass( "ui-state-highlight" );
       setTimeout(function() {
         tips.removeClass( "ui-state-highlight", 1500 );
       }, 500 );
     }
  
     function checkRegexp( o, regexp, n ) {
       if ( !( regexp.test( o.val() ) ) ) {
         o.addClass( "ui-state-error" );
         updateTips( n );
         return false;
       } else {
         return true;
       }
     }
     
     fillDialog = function (d,info) {
    	 $(d).find("#username").text(info.split('|')[0]);
    	 $(d).find("#account").text(info.split('|')[1]);
    	 $(d).find("#profile").text(info.split('|')[2]);    	 
     }
 
    function addAmount() {
      var valid = true;
      allFields.removeClass( "ui-state-error" );
  
      valid = checkRegexp( deposit, /^[0-9]+\.?[0-9]*$/, "Format is x.y" );
 
      if ( valid ) {
    	
        depositToAccount(deposit.val(), d.find("#username").text(), d.find("#account").text(),d.find("#profile").text());
        dialog_add.dialog( "close" );
      }
      return valid;
    }
 
    dialog_add = $( "#dialog-form-add" ).dialog({
      autoOpen: false,
      height: 400,
      width: 350,
      modal: true,
      buttons: {
        "Add amount": addAmount,
        Cancel: function() {
          dialog_add.dialog( "close" );
        }
      },
      close: function() {
        form[ 0 ].reset();
        allFields.removeClass( "ui-state-error" );
      }
    });
 
    form = dialog_add.find( "form" ).on( "submit", function( event ) {
      event.preventDefault();
      addAmount();
    }); 
 

<!-- The dialog to confirm the rebalance of a profile of an account -->  

    var r = $("#dialog-rebalance");


    function rebalance() {
        rebalanceAccount(r.find("#username").text(), r.find("#account").text(),r.find("#profile").text());
        dialog_rebalance.dialog( "close" );
    }

    dialog_rebalance = $("#dialog-rebalance").dialog({
       autoOpen: false,
       resizable: false,
       height: "auto",
       width: 400,
       modal: true,
       buttons: {
         "Rebalance now": rebalance,
         Cancel: function() {
             dialog_rebalance.dialog( "close" );
              }
       }
    });


}