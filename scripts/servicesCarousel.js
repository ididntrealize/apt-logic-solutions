$(document).ready(function () {

    var cursorX = -1;
    var cursorY = -1;
    var recentX = -1;
    var recentY = -1;
    document.onmousemove = function(event) {
        cursorX = event.pageX;
        cursorY = event.pageY;
    }

    let mouseInterval = setInterval(() => {
        recentX = cursorX;
        recentY = cursorY;
    }, 500)

    if (window.screen.width < 768) {
        $('section.services-section .service p').toggle()
        $('section.services-section .service').on('click', (e) => {
            // toggle in paragraph of hovered service
            $($($(e.currentTarget)[0]).find('p')[0]).slideToggle()
        })
        clearInterval(mouseInterval);
    }

    function activeMouse() {
        return Math.abs(cursorX) != Math.abs(recentX)
            || Math.abs(cursorY) != Math.abs(recentY)
    }
    
    function servicesCarousel() {
        let services = $('section.services-section .service')
        let activeHover = $('section.services-section .service:hover').length > 0
        if (activeHover && activeMouse()) {
            return false
        }
        for (let i = 0; i <= services.length; i++) {
            let nextIndex = (i + 1) % 6
            // console.log(services[nextIndex])
            if ($(services[i]).hasClass('active')) {
                $(services[i]).removeClass('active')
                $(services[nextIndex]).addClass('active')
                break;
            }
        }
    }

    let servicesCarouselInterval = setInterval(servicesCarousel , 6700) 

    //services section
    $('section.services-section .service').on('mouseover', () => {
        if(activeMouse()) {
            $('section.services-section .service').removeClass('active')
            $('section.services-section .service:hover').addClass('active')
            
            clearInterval(servicesCarouselInterval)
            servicesCarouselInterval = undefined

            setTimeout( () => {
                servicesCarouselInterval = setInterval(servicesCarousel, 6000)
            }, 0)
        }
    })
    $('section.services-section').on('mouseleave', () => {
        let activeHover = $('section.services-section .service:hover').length > 0;
        if (activeHover) {
            $('section.services-section .service').removeClass('active')
        }
    })

    
});