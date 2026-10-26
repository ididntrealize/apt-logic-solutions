let currentUrl = window.location.href;

/* Page load function */
function switchPage(event) {
    event.preventDefault();

    var linkLocation = $(this).attr("href");
    changeToPage(linkLocation, true);

    //if dropdown toggle is visible, hide menu on click
    if ($('.navbar-toggle').css('display') != 'none') {
        $('.navbar-collapse').collapse('hide');

    }

}

function changeToPage(pageName, scrollToPage) {

    var pageExtension = "page/" + pageName;
    var scrollToLocation = "#mainBodyContainer";
    var navBarHeight = 68;

    $("#mainBodyContainer").load(pageExtension, function () {

        //update query string
        if ('URLSearchParams' in window) {
            var searchParams = new URLSearchParams(window.location.search);
            searchParams.set("page", pageName);
            //window.location.search = searchParams.toString();\
            var newurl = window.location.protocol + "//" + window.location.host + window.location.pathname + '?' + searchParams.toString();
            window.history.pushState({path: newurl}, '', newurl);
            
            currentUrl = newurl;
        }

        if (scrollToPage) {
            setTimeout(function () {
                /*check if scroll necessary */
                if (pageName.includes("#")) {
                    scrollToLocation = "#" + pageName.split("#")[1];
                    
                }

                //don't consider ?query=var in #scrollTo
                if (pageName.includes("?")) {
                    scrollToLocation = scrollToLocation.split("?")[0];

                    //update query string
                    if ('URLSearchParams' in window) {
                        var searchParams = new URLSearchParams(window.location.search);
                        searchParams.set("page", pageName.split("?")[0]);

                        if( pageName.split("?")[1].includes('plan=') ) {
                            searchParams.set("plan", pageName.split("plan=")[1]);
                        }

                        var newurl = window.location.protocol + "//" + window.location.host + window.location.pathname + '?' + searchParams.toString();
                        window.history.pushState({path: newurl}, '', newurl);
                        
                        currentUrl = newurl;
                        queryActions();
                    }

                }

                let userPosition = $('html, body').scrollTop();
                let pageTop = $(scrollToLocation).offset().top - navBarHeight;
                let animationSpeed = userPosition > 1400 ? 1400 : 666;

                if(userPosition !== pageTop){
                    $('html, body').animate({
                        scrollTop: $(scrollToLocation).offset().top - navBarHeight
                    }, animationSpeed);
                }
            }, 200);
        }

    });

    var pageTitle = pageName.split(".")[0],
        pageTitleCapitilized = pageTitle.charAt(0).toUpperCase() + pageTitle.slice(1);

    $("title").html(pageTitleCapitilized + " - CoreyBorg Web Development");


}

function goToQueryString() {
    var searchParams = new URLSearchParams(window.location.search);
    if( searchParams.get("page") ) {
        var newPageName = searchParams.get("page");
        if (window.location.href.includes("#")) {
            newPageName += "#" + window.location.href.split("#")[1];
        }

        changeToPage( newPageName, true )
    } else {
        changeToPage( 'home.html', false );
    }
}

function queryActions() {
    var searchParams = new URLSearchParams(window.location.search);
    
    if( searchParams.get("plan") ) {

        console.log('plan earchParams', searchParams.get("plan"))

        var selectedPlanName = searchParams.get("plan");
        console.log('trying: ', $('.toggle-site-plan'))
        //select radio for any plan
        $('.toggle-site-plan').click();
        //select specific plan requested
        $('.' + selectedPlanName + "-plan-toggle").click();
    

    }
}



window.addEventListener('popstate', function(e) {
    let targetUrl = window.location.href;
    if( targetUrl.split('#')[0] !== currentUrl.split('#')[0]) {
        goToQueryString();
    }
});


//on page load set page from query string
$( document ).ready(function() {
    goToQueryString();
    
});