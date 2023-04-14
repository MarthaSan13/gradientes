$(document).ready(function () {

    // lock scroll
    var scrollPosition = [
    self.pageXOffset || document.documentElement.scrollLeft || document.body.scrollLeft,
    self.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop];
    var html = $('html');
    html.data('scroll-position', scrollPosition);
    html.data('previous-overflow', html.css('overflow'));
    html.css('overflow', 'hidden');
    window.scrollTo(scrollPosition[0], scrollPosition[1]);
    $('html, body').mousedown(function (e) {
        if (e.button == 1) return false;
    });
    $('html, body').on('touchmove', function(e){
         e.preventDefault();
    });

    // responsive resizing
    function responsiveResize() {

        // get device and content height and calculate content areas
        var deviceHeight = $(window).height();
        var phoneOuterHeight = $('.forward_mockup').height();
        var slideHeight = $('.forward_phoneslide').height();

        if (!(window.mozInnerScreenX == null) || !jQuery.support.leadingWhitespace) {
            var phoneMargin = (parseInt($('.forward_content_container').offset().left)+25);
        } else {
            var phoneMargin = (parseInt($('.forward_content_container').css('marginLeft'))+25);
        }

        var slideIncrement = slideHeight;

        $('.forward_phone').css('left', phoneMargin);
        $('.forward_phone').css('height', phoneOuterHeight);
        $('.forward_slides_container').css('height', slideHeight);

        $(".normal_content").each(function() {
            var contentHeight = $(this).height();
            $(this).css('padding-top', Math.round((deviceHeight - contentHeight) / 2));
            $(this).css('padding-bottom', Math.round((deviceHeight - contentHeight) / 2));
        });

        phoneOffset = (deviceHeight - $('.forward_mockup_container').height())/2;
        $('.forward_phone').css('top', phoneOffset);
        if ($('.active').hasClass("fake_slide")) {
            $(".forward_phone").css('margin-top', phoneOuterHeight - phoneOffset*0.5);
        }

        var headerHeight = $('.header_content').height();

        // recalculate current slide margintop
        if (!$('.active').hasClass("fake_slide")) {
            if ($('.active').hasClass('first_slide')) {
                $("#slide1").css('margin-top', '0px');
            } else if ($('.active').hasClass("fake_slide_footer")) {
                $("#slide1").css('margin-top', -Math.round(slideIncrement*(currentContent -2)));
            } else {
                $("#slide1").css('margin-top', -Math.round(slideIncrement*(currentContent -1)));
            }
        }

        if ($('.forward_nav').css('position') == 'fixed') {
            if (!(window.mozInnerScreenX == null) || !jQuery.support.leadingWhitespace) {
                navMargin = (parseInt($('.forward_content_container').offset().left));
            } else {
                navMargin = (parseInt($('.forward_content_container').css('marginLeft')));
            }
            $('.forward_nav').css('margin-right', navMargin);
        }

        // recalculate nav margin
        var navHeight = ($('.forward_nav').height() + 20);
        var navOffset = ($(window).height() - navHeight) / 2;
        $('.forward_nav').css('top', navOffset);

        // keep scroll at the top of current content
        var currentTop = $('.forward_scroll').find('.forward_phoneslide.active, .fake_slide.active, .fake_slide_footer.active').attr('id').replace('slide','');
        $('html, body').stop().animate({
            scrollTop: $('#content'+currentTop).offset().top
        }, 10);
    }

    // initial calculations
    $(window).load(function() {
        // generate navigation
        $(".forward_content").each(function() {
            if (!$(this).hasClass('footer_content')) {
                var navigationID = $(this).attr('id').replace('content','');
                $(".forward_nav").append('<li class="forward_nav_item" id="forward_nav' + navigationID + '"></li>');
            }
        });
        $("#forward_nav0").addClass('scrolled_to');
        var navHeight = ($('.forward_nav').height() + 20);
        var navOffset = ($(window).height() - navHeight) / 2;
        $('.forward_nav').css('top', navOffset);

        responsiveResize();

        // reset on page load
        $('html, body').stop().animate({
            scrollTop: $('.forward_wrapper').scrollTop()
        }, 10);
    });

    // detect resize
    $(window).on('resize', function () {
        responsiveResize();
    });

    // recalculate on device orientation change
    if (window.addEventListener) {
        window.addEventListener("orientationchange", function() {
            setTimeout(function () {
                responsiveResize();
            }, 100);
        });
    } else {
        window.attachEvent("orientationchange", function() {
            setTimeout(function () {
                responsiveResize();
            }, 100);
        });
    }

    // detect device orientation change
    if (window.addEventListener) {
        window.addEventListener("orientationchange", function() {
            responsiveResize();
            var orientation = Math.abs(window.orientation) == 90 ? 'landscape' : 'portrait';
            var isiPhone = navigator.userAgent.toLowerCase().indexOf("iphone");
            var isiPad = navigator.userAgent.toLowerCase().indexOf("ipad");
            var isiPod = navigator.userAgent.toLowerCase().indexOf("ipod");
            // if ( (orientation == 'landscape' && isiPhone > -1) || (orientation == 'landscape' && isiPad > -1) || (orientation == 'landscape' && isiPod > -1) ) {
            if ( orientation == 'landscape' ) {
                var deviceWidth = $(window).width();
                phoneOffset = (deviceWidth - $('.forward_mockup_container').height())/2;
                $('.forward_phone').css('top', phoneOffset);
            }
        }, false);
    } else {
        window.attachEvent("orientationchange", function() {
            responsiveResize();
        });
    }

    // globals for main function
    var stop = false;
    var slideOffset = 0;
    var navSlideOffset = 0;
    var contentNumber = ($('.forward_content').length - 1);
    var currentContent = 0;
    var swiped = false;
    var swipedUp = false;
    var swipedDown = false;
    var scrollDistance = 0;
    var navitemScroll = 0;
    var navScrollDistance = 0;
    var currentNav = 0;
    var navDiff = 0;
    var phoneOffset = 0;
    var navMargin = 0;
    var navHeight = 0;
    var navOffset = 0;

    // main function
    function mainScroll(e) {
        var phoneHeight = $('.forward_phoneslide').height();
        var phoneOuterHeight = $('.forward_mockup').height();
        var slideIncrement = phoneHeight;

        if (swiped === true) {
            if (swipedUp === true) {
                var delta = -1;
            } else if (swipedDown === true) {
                var delta = 1;
            }
        } else {
            if (!(window.mozInnerScreenX == null)) {
                var delta = -(e.originalEvent.detail);
            } else {
                var delta = e.originalEvent.wheelDelta;
            }
        }

        if (delta < 0 && stop === false && currentContent >= 0 && currentContent < contentNumber) {
            stop = true;
            slideOffset = -(parseInt($("#slide1").css('margin-top'))) + slideIncrement;
            $('.forward_nav_item').removeClass('scrolled_to');

            if ( currentContent == 1 ) {
                if (!(window.mozInnerScreenX == null) || !jQuery.support.leadingWhitespace) {
                    navMargin = (parseInt($('.forward_content_container').offset().left));
                } else {
                    navMargin = (parseInt($('.forward_content_container').css('marginLeft')));
                }
                $('.forward_nav').css('position', 'fixed');
                $('.forward_nav').css('margin-right', navMargin);
            }

            if ( currentContent == 0 ) {
                $(".forward_phone").stop().velocity({
                    marginTop: 0
                }, 900);
                $('#slide'+currentContent).removeClass('active');
                currentContent++;
                $('#slide'+currentContent).addClass('active');
                $('#forward_nav'+currentContent).addClass('scrolled_to');
                scrollDistance = $('#content'+currentContent).offset().top;
                $('html, body').stop().animate({
                    scrollTop: scrollDistance
                }, {
                    duration: 1000,
                    complete: function () {
                        stop = false;
                    }
                });
            } else {
                $('#slide'+currentContent).removeClass('active');
                currentContent++;
                $('#slide'+currentContent).addClass('active');
                $('#forward_nav'+currentContent).addClass('scrolled_to');
                scrollDistance = $('#content'+currentContent).offset().top;

                if (currentContent != 5) {
                    $("#slide1").stop().velocity({
                        marginTop: -Math.round(slideOffset)
                    }, 900);
                } else {
                    $(".forward_phone").stop().velocity({
                        marginTop: -phoneOffset*0.9
                    }, 850);
                    $(".forward_nav").stop().velocity({
                        marginTop: -phoneOffset*1.85
                    }, 850);
                }

                $('html, body').stop().animate({
                    scrollTop: scrollDistance
                }, {
                    duration: 1000,
                    complete: function () {
                        stop = false;
                    }
                });
            }

        } else if (delta > 0 && stop === false && currentContent > 0 && currentContent <= contentNumber) {
            stop = true;
            slideOffset = -(parseInt($("#slide1").css('margin-top'))) - slideIncrement;
            $('.forward_nav_item').removeClass('scrolled_to');

            if ( currentContent == 2 ) {
                setTimeout(function () {
                    $('.forward_nav').css('position', 'absolute');
                    $('.forward_nav').css('margin-right', 0);
                }, 1010);
            }

            if ( currentContent == 1 ) {
                $(".forward_phone").stop().velocity({
                    marginTop: phoneOuterHeight - phoneOffset*0.5
                }, 900);
                $('#slide'+currentContent).removeClass('active');
                currentContent--;
                $('#slide'+currentContent).addClass('active');
                $('#forward_nav'+currentContent).addClass('scrolled_to');
                scrollDistance = $('#content'+currentContent).offset().top;
                $('html, body').stop().animate({
                    scrollTop: scrollDistance
                }, {
                    duration: 1000,
                    complete: function () {
                        stop = false;
                    }
                });
            } else {
                $('#slide'+currentContent).removeClass('active');
                currentContent--;
                $('#slide'+currentContent).addClass('active');
                $('#forward_nav'+currentContent).addClass('scrolled_to');
                scrollDistance = $('#content'+currentContent).offset().top;

                if (currentContent != 4) {
                    $("#slide1").stop().velocity({
                        marginTop: -Math.round(slideOffset)
                    }, 900);
                } else {
                    $(".forward_phone, .forward_nav").stop().velocity({
                        marginTop: 0
                    }, 850);
                }

                $('html, body').stop().animate({
                    scrollTop: scrollDistance
                }, {
                    duration: 1000,
                    complete: function () {
                        stop = false;
                    }
                });
            }
        }

        swiped = false;
        swipedUp = false;
        swipedDown = false;
    }

    // nav function
    function navScroll() {
        var phoneHeight = $('.forward_phoneslide').height();
        var slideIncrement = phoneHeight;
        var phoneOuterHeight = $('.forward_mockup').height();
        navScrollDistance = $('#content'+navitemScroll).offset().top;
        currentNav = $('.forward_scroll').find('.forward_phoneslide.active, .fake_slide.active, .fake_slide_footer.active').attr('id').replace('slide','');
        navDiff = Math.abs(currentNav - navitemScroll);
        currentContent = navitemScroll;

        if (stop === false) {
            stop = true;
            $('.forward_nav_item').removeClass('scrolled_to');
            $('#forward_nav'+navitemScroll).addClass('scrolled_to');
            $('.forward_scroll').find('.forward_phoneslide.active, .fake_slide.active, .fake_slide_footer.active').removeClass('active');
            $('html, body').stop().animate({
                scrollTop: navScrollDistance
            }, {
                duration: 900*navDiff,
                complete: function () {
                    stop = false;
                },
                step: function ( num ) {
                    if ( navitemScroll == 0 ) {
                        screenNow = num;
                        var navReset = $('.header_content').height();
                        if ( screenNow > navReset - 15 && screenNow < navReset + 15 ) {
                            $('.forward_nav').css('position', 'absolute');
                            $('.forward_nav').css('margin-right', 0);
                        }
                    }
                }
            });

            if ( navitemScroll < currentNav && navitemScroll != 0 && currentNav != 0 ) {
                navSlideOffset = Math.abs(slideIncrement*(1 - navitemScroll));
                $("#slide1").stop().velocity({
                    marginTop: -Math.round(navSlideOffset)
                }, 850*navDiff);
                if ( currentNav == 5 ) {
                    $(".forward_phone, .forward_nav").stop().velocity({
                        marginTop: 0
                    }, 850);
                }

            } else if ( navitemScroll > currentNav && navitemScroll != 0 && currentNav != 0 ) {
                navSlideOffset = Math.abs(parseInt($("#slide1").css('margin-top'))) + slideIncrement*navDiff;
                $("#slide1").stop().velocity({
                    marginTop: -Math.round(navSlideOffset)
                }, 850*navDiff);

            } else if ( navitemScroll == 0 ) {
                $("#slide1").stop().velocity({
                    marginTop: 0
                }, 850*navDiff);
                $(".forward_phone").stop().velocity({
                    marginTop: phoneOuterHeight - phoneOffset*0.5
                }, 1000*navDiff);

                if ( currentNav == 5 ) {
                    $(".forward_nav").animate({
                        marginTop: 0
                    }, 850);
                }

            } else if ( currentNav == 0 ) {
                navSlideOffset = Math.abs(slideIncrement*(navDiff - 1));
                $("#slide1").stop().velocity({
                    marginTop: -Math.round(navSlideOffset)
                }, 850*navDiff);
                $(".forward_phone").stop().velocity({
                    marginTop: 0
                }, 1000);

                setTimeout(function () {
                    if (!(window.mozInnerScreenX == null) || !jQuery.support.leadingWhitespace) {
                        navMargin = (parseInt($('.forward_content_container').offset().left));
                    } else {
                        navMargin = (parseInt($('.forward_content_container').css('marginLeft')));
                    }
                    var navOffsetTopM = $(window).height()*(navDiff - 1);
                    $(".forward_nav").stop().animate({
                        marginTop: navOffsetTopM
                    }, {
                        duration: 800*navDiff,
                        complete: function () {
                            $('.forward_nav').css('position', 'fixed');
                            $('.forward_nav').css('margin-top', 0);
                            $('.forward_nav').css('margin-right', navMargin);
                        }
                    });
                }, 450);
            }

            if ( currentNav == 1 && navitemScroll > 1 ) {
                if (!(window.mozInnerScreenX == null) || !jQuery.support.leadingWhitespace) {
                    navMargin = (parseInt($('.forward_content_container').offset().left));
                } else {
                    navMargin = (parseInt($('.forward_content_container').css('marginLeft')));
                }
                $('.forward_nav').css('position', 'fixed');
                $('.forward_nav').css('margin-right', navMargin);
            }

            $('#slide'+navitemScroll).addClass('active');
        }
    }

    // chrome,ie,opera detect scroll attempt and scroll
    $('html').on('mousewheel', function (e) {
        mainScroll(e);
    });

    // firefox detect scroll attempt and scroll
    $('html').on('DOMMouseScroll', function (e) {
        mainScroll(e);
    });

    // swipe detect and scroll
    $('body').swipe( {
        swipeUp:function(event, direction, distance, duration, fingerCount) {
            swiped = true;
            swipedUp = true;
            swipedDown = false;
            mainScroll();
        },
        swipeDown:function(event, direction, distance, duration, fingerCount) {
            swiped = true;
            swipedUp = false;
            swipedDown = true;
            mainScroll();
        }
    });

    // nav click and scroll
    $('.forward_nav').delegate('.forward_nav_item', 'click touchstart', function() {
        navitemScroll = $(this).attr('id').replace('forward_nav','');
        navScroll();
    });

    // up down arrow and scroll
    $(document).on("keydown", function(e){
        if(e.keyCode === 38) {
            // up
            swiped = true;
            swipedUp = false;
            swipedDown = true;
            mainScroll();
        } else if (e.keyCode === 40) {
            // down
            swiped = true;
            swipedUp = true;
            swipedDown = false;
            mainScroll();
        }
        e.preventDefault();
    });

    // arrow click and scroll
    $('.arrow').on('click touchstart', function() {
        if ( stop === false ) {
            stop = true;
            var arrowScroll = $(this).attr('id').replace('arrow','');
            var phoneHeight = $('.forward_phoneslide').height();
            var phoneOuterHeight = $('.forward_mockup').height();
            var slideIncrement = phoneHeight;
            slideOffset = -(parseInt($("#slide1").css('margin-top'))) + slideIncrement;

            if ( arrowScroll == 1 ) {
                if (!(window.mozInnerScreenX == null) || !jQuery.support.leadingWhitespace) {
                    navMargin = (parseInt($('.forward_content_container').offset().left));
                } else {
                    navMargin = (parseInt($('.forward_content_container').css('marginLeft')));
                }
                $('.forward_nav').css('position', 'fixed');
                $('.forward_nav').css('margin-right', navMargin);
            }

            $('#slide'+arrowScroll).removeClass('active');
            $('#forward_nav'+arrowScroll).removeClass('scrolled_to');
            arrowScroll++;
            $('#slide'+arrowScroll).addClass('active');
            $('#forward_nav'+arrowScroll).addClass('scrolled_to');
            currentContent = arrowScroll;

            scrollDistance = $('#content'+arrowScroll).offset().top;
            $('html, body').stop().animate({
                scrollTop: scrollDistance
            }, {
                duration: 1000,
                complete: function () {
                    stop = false;
                }
            });

            if (arrowScroll != 5) {
                $("#slide1").stop().velocity({
                    marginTop: -Math.round(slideOffset)
                }, 900);
            } else {
                $(".forward_phone").stop().velocity({
                    marginTop: -phoneOffset*0.9
                }, 850);
                $(".forward_nav").stop().velocity({
                    marginTop: -phoneOffset*1.85
                }, 850);
            }
        }
    });
});