$(function() {

    // Get the form.
    let form = $('#ajax-contact');

    //initial state for Ready to buy signal
    if( $('input.toggle-site-plan').selected ){
        $('.site-plan').show();
    } else {   
        $('.site-plan').hide();
    }

    //trigger visibility of plans
    form.find('input.form-check-input').on('click', (link) => {
        let inputMatchesClass = $(link.target).hasClass('toggle-site-plan');
        let inputIsInsideToggle = $('.site-plan').find( $(link.target) ).length > 0;

        if ( inputMatchesClass || inputIsInsideToggle) {
            $('.site-plan').show();
        } else {
            $('.site-plan').hide();
        }

        if ( inputIsInsideToggle ) {
            //add true value to any selected .site-plan input (for serializinging in contactform post call)
            $(link.target).prop('checked') ? $(link.target)[0].value = "true" : $(link.target)[0].value = "false";
        }
    });

    /* SUBMITTING THE FORM */

   //toggle error messages
	$(".errorDiv").toggle();

	//track past errors
	var erroredName = false,
		erroredEmail = false,
		erroredMessage = false;
	
	//validate email adresses
	function isEmail(email) {
		var regex = /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/;
		return regex.test(email);
	}

    function botBot(text) {
        const words = text.split(/\s+/);
        const regex = /^(?![A-Z]+$)(?=.*[A-Z].*[A-Z])(?=.*[a-z])[A-Za-z0-9]+$/;
        return words.some(word => regex.test(word));
    }
   
   $(form).submit(function(event) {
		// Stop the browser from submitting the form.
		event.preventDefault();
        const form = document.querySelector('form');

		var name = $("#name").val(),
			email= $("#email").val(),
			message= $("#message").val();
		
		//Error handling
		if(name == "" || name.length > 1000){
			$("#nameErrorDiv").show();
			erroredName=true;
		}else{
			$("#nameErrorDiv").hide();
			erroredName=false;
		}
		
		var validEmail = isEmail(email);
		if (!validEmail){
			$("#emailErrorDiv").show();
			erroredEmail=true;
		}else{
			$("#emailErrorDiv").hide();
			erroredEmail=false;
		}
		
		if(message==""){
			$("#messageErrorDiv").show();
			erroredMessage=true;
		}else{
			$("#messageErrorDiv").hide();
			erroredMessage=false;
		}

        if (botBot(message) || botBot(name)) {
            form.reset();
            $('#form-messages').addClass('success')
            $('#form-messages').html('Thanks much, email sent!');
            return
        }
		
		if(!erroredEmail && !erroredName && !erroredMessage){

            const data = {};
            const formElements = Array.from(form);
            formElements.map(input => (data[input.name] = input.value));

            // Construct an HTTP request
            var xhr = new XMLHttpRequest();
            xhr.open(form.method, form.action, true);
            xhr.setRequestHeader('Accept', 'application/json; charset=utf-8');
            xhr.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');

            // Send the collected data as JSON
            xhr.send(JSON.stringify(data));

            // Callback function
            xhr.onloadend = response => {
            if (response.target.status === 200) {
                // The form submission was successful
                form.reset();
                $('#form-messages').addClass('success')
                $('#form-messages').html('Thanks much, email sent!');
            } else {
                // The form submission failed
                $('#form-messages').html('Something went wrong!');
                console.error(JSON.parse(response.target.response).message);
            }
            };
			
	 }
		
	});
   
   
});
