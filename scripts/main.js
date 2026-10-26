(function() {
	
	/*align menu items right above hamburger size */
		var docWidth = $(document).width();
		if(docWidth>750){
			$("#navbar ul").addClass("float-right");
		}
	
	/* initiate home page
		$("#mainBodyContainer").load("page-content/porfolio.html");
	 */
	
	/*Zoom to contact on project page*/
		$(".contactButton").click(function() {
			var navBarHeight = 62;
			//$(".navbar-fixed-top").height();
			
			$('html, body').animate({
				scrollTop: $("#contactSection").offset().top - navBarHeight
			}, 1500);
		});
		
	/*Zoom to top*/
		$(".toTopButton").click(function() {
			$('html, body').animate({
				scrollTop: 0
			}, 1500);
		});	
	
	
	/* shrink menu on scroll */
	$(window).scroll(function() {
	  if ($(document).scrollTop() > 50) {
		$('nav').addClass('shrink');
	  } else {
		$('nav').removeClass('shrink');
	  }
	});
	
	//realign thumbs on xs 
		var containerWidth= $(".container").width();
		if (containerWidth<=750){
			$(".site-thumb").removeClass("float-right");
			$(".site-thumb").addClass("mx-auto");
			$(".skill-icon").addClass("mx-auto");
		}
	
	})();

	const timestamp = Date.now();
	const now = new Date(timestamp);
	
	const hours = now.getHours().toString().padStart(2, '0');
	const minutes = now.getMinutes().toString().padStart(2, '0');
	const seconds = now.getSeconds().toString().padStart(2, '0');


	if (hours < 7 || hours >= 21) {
		// night time
		$('body').addClass("night")
		$('body').removeClass("sunset")

	} else if (hours >= 9 && hours < 19) {
		//day time
		$('body').removeClass("night")
		$('body').removeClass("sunset")

	} else {
		// Sunset
		$('body').removeClass("night")
		$('body').addClass("sunset")

	}