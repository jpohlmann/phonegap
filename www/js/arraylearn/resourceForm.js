$(document).ready(function(){
    $( "#dialog" ).dialog({
        autoOpen: false,
        buttons: {
            Ok: function() {
                $('#confirmed').val("1");
                $('#emailForm').submit();
                $( this ).dialog( "close" );
            },
            Cancel: function() {
              $( this ).dialog( "close" );
            }
        }
    });
    $('#activity_id').change(function(){
        $.ajax({
            url: "./resource-email",
            type: "GET",
            data: {activityId: $('#activity_id').val()},
            complete: function(response){
                var responseObj = $.parseJSON(response.responseText);
                if (responseObj.length > 0) {
                    var existingEmail = responseObj[0];
                    $('#from').val(existingEmail.from);
                    $('#subject').val(existingEmail.subject);
                    $('#noteBody').val(existingEmail.noteBody);
                    CKEDITOR.instances.noteBody.setData(existingEmail.noteBody);
                }else{
                    $('#from').val('');
                    $('#subject').val('');
                    $('#noteBody').val('');
                    CKEDITOR.instances.noteBody.setData('');
                    
                }
            }
        });
    });
    $('#emailForm').on('submit', function(){
    	$('#noteBody').val(CKEDITOR.instances.noteBody.getData());
        if(!$('#emailForm').validationEngine('validate')){
            return false;
        }
        var checkbox = $('#test');
        if (!checkbox[0].checked && ($('#confirmed').val() == "0")) {
            $( "#dialog" ).dialog("open");
            return false;
        }
        $.ajax({
            type: "POST",
            url: '/arraylearn/email/send-resource',
            data: $("#emailForm").serialize(), // serializes the form's elements.
            complete: function(data)
            {
              var responseObj = $.parseJSON(data.responseText);
              var successes = 0;
              var errors = 'Errors: <br>';
              for(var x in responseObj){
                  if (responseObj[x] == true) {
                      successes++;
                  } else {
                      errors += x+' - '+responseObj[x]+'<br>';
                  }
              }
              $( "#dialog-confirm" ).html('<p>Successful: '+successes+'</p><p>'+errors+'</p>');
              $(function() {
                $( "#dialog-confirm" ).dialog({
                  resizable: false,
                  height:500,
                  width: 500,
                  modal: true,
                  buttons: {
                    "Ok": function() {
                      $( this ).dialog( "close" );
                    }
                  }
                });
              });
            }
          });
        return false;
    });
    $('#test').on('click', function(){
        if(!this.checked){
            $('#test_recipients').val('');
            $("#test_recipients").prop('disabled', true);
            $("#sendone").prop('disabled', true);
        } else {
            $("#test_recipients").prop('disabled', false);
            $("#sendone").prop('disabled', false);
        }
    });
});