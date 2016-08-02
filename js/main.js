$(document).ready(function() {
	if ($('#geo-map').length) {
		baron({
			root: '.baron',
		    scroller: '.baron__scroller',
			bar: '.baron__bar',
			scrollingCls: '_scrolling',
			draggingCls: '_dragging'
	  	}).controls({
	    	track: '.baron__track',
	    	forward: '.baron__down',
	    	backward: '.baron__up'
	  	});
	}

	function showServiceMsg() {
		$('#service-msg-container').addClass('modal-container--active');
		$('#service-msg').addClass('modal--active');
		$('.modal-overlay').addClass('modal-overlay--active');
	}

	var mainSlider = function() { // слайдер на главной странице
		var changeSlide = function(index, reset) {
			if (reset) {
				clearInterval(changeItem);
				doChangeItem();
			}

			$('.main-slide--active').removeClass('main-slide--active');
			$('.main-slider__item--active').removeClass('main-slider__item--active');
			$($('.main-slide')[index]).addClass('main-slide--active');
			$($('.main-slider__item')[index]).addClass('main-slider__item--active');
		}

		$('#next-main-slide').click(function() {
			var nextSlideIndex = $('.main-slide--active').index() + 1;
			if (nextSlideIndex === $('.main-slide').length) nextSlideIndex = 0;
			changeSlide(nextSlideIndex, true);
		})

		$('#prev-main-slide').click(function() {
			var prevSlideIndex = $('.main-slide--active').index() - 1;
			if (prevSlideIndex === -1) prevSlideIndex = $('.main-slide').length - 1;
			changeSlide(prevSlideIndex, true);
		})

		$('.main-slider__item').click(function() {
			var nextSlideIndex = $(this).index();
			changeSlide(nextSlideIndex, true);
		})

		var changeItem;
		function doChangeItem() {
	    	changeItem = setInterval(function() {
	    		var nextSlideIndex = $('.main-slider__item--active').index() + 1;
	    		if (nextSlideIndex === $('.main-slide').length) nextSlideIndex = 0;
	    		changeSlide(nextSlideIndex, false);
	    	}, 10000)
		}
		doChangeItem();
	}()

	if ($('nav').length) {
		function fixedNav() {
			var navOffset = $('nav').offset().top + 100;

			if ($(window).scrollTop() >= navOffset) {
				$('.fixed-nav-wrap').addClass('fixed-nav-wrap--active');
				$('.sub-menu-overlay').hide();
				$('.sub-menu-overlay--fixed').show();
			} else {
				$('.fixed-nav-wrap').removeClass('fixed-nav-wrap--active');
				$('.sub-menu-overlay').show();
				$('.sub-menu-overlay--fixed').hide();
				$('.sub-menu-wrap--active').removeClass('sub-menu-wrap--active');
				$('.main-menu__item--active').removeClass('main-menu__item--active');
				$('.sub-menu-overlay').removeClass('sub-menu-overlay--active');
			}
		}

		$(window).scroll(function() {
			fixedNav();
		})
	}

	var geoMap = function() {
		var map;
	    DG.then(function () {
	        map = DG.map('geo-map', {
	            center: [48.46897578085214,135.1129739999999],
	            zoom: 6,
	            scrollWheelZoom: false,
				dragging: false
	        });

	        var myIcon = DG.icon({
			    iconUrl: '/img/map-target.png',
			    iconSize: [34, 51],
			    iconAnchor: [17, 51],
			    popupAnchor: [0, 3.5],
			});

			map.on('zoomend', function() {
				if (this._popup) $(this._popup._container).css('left', '-240px');
			})

			if ($('.contacts').length) {
				popupHtml = "<div class='map-popup'><div class='popup-logo'></div>" +
								"<p class='popup-text'>г. Иркутск, ул. Сурикова, 6</p>" +
								"<p class='popup-text'></p></div>";

				var marker = DG.marker([52.288370288815706,104.27010500000002], {icon: myIcon}).addTo(map).bindPopup(popupHtml);

				$('#show-office').click(function() {
					marker.openPopup();
				})

				marker.on('popupopen', function() {
					$(this._popup._container).css('left', '-240px');
					map.setZoom(13);
					map.setView(marker._latlng);
				})
			}

			$('.geography__target').each(function() {
				var coords = JSON.parse($(this).attr('data-coords'));
				var adress = $(this).attr('data-adress');
				var tel = $(this).attr('data-tel');

				popupHtml = "<div class='map-popup'><div class='popup-logo'></div>" +
								"<p class='popup-text'>" + adress + "</p>" +
								"<p class='popup-text'>" + tel + "</p></div>";

				var marker = DG.marker(coords, {icon: myIcon}).addTo(map).bindPopup(popupHtml);

				var $thisTarget = $(this);

				marker.on('popupopen', function() {
					$(this._popup._container).css('left', '-240px');
					map.setZoom(13);
					map.setView(marker._latlng);

					$thisTarget.addClass('geography__target--active')

					var $region = $thisTarget.closest('.geography__region');
					var $area = $thisTarget.closest('.geography__area');

					if ($region.hasClass('geography__region--active')) {
						if (!$area.hasClass('geography__area--active')) {
							$('.geography__area--active').find('.geography__targets').slideUp();
							$('.geography__area--active').removeClass('geography__area--active');

							$area.addClass('geography__area--active');
							$thisTarget.closest('.geography__targets').slideDown();
						}
					} else {
						$('.geography__region--active').find('.geography__areas').slideUp();
						$('.geography__region--active').removeClass('geography__region--active');
						$('.geography__area--active').find('.geography__targets').slideUp();
						$('.geography__area--active').removeClass('geography__area--active');

						$region.addClass('geography__region--active');
						$area.addClass('geography__area--active');
						$thisTarget.closest('.geography__areas').slideDown(400, function() {
							$thisTarget.closest('.geography__targets').slideDown();
						});
					}
				})

				marker.on('popupclose', function() {
					$thisTarget.removeClass('geography__target--active')
				})

				$(this).click(function() {
					if ($(this).hasClass('geography__target--active')) {
						marker.closePopup();
						$(this).removeClass('geography__target--active');
					} else {
						$('.geography__target--active').removeClass('geography__target--active');

						$('html, body').animate({
					        scrollTop: $("#geo-map").offset().top
					    }, 1000);

						marker.openPopup();
						$(this).addClass('geography__target--active');
					}
				})
			})

			$('.geography__area--target').each(function() {
				var coords = JSON.parse($(this).attr('data-coords'));
				var adress = $(this).attr('data-adress');
				var tel = $(this).attr('data-tel');

				popupHtml = "<div class='map-popup'><div class='popup-logo'></div>" +
								"<p class='popup-text'>" + adress + "</p>" +
								"<p class='popup-text'>" + tel + "</p></div>";

				var marker = DG.marker(coords, {icon: myIcon}).addTo(map).bindPopup(popupHtml);

				var $thisTarget = $(this);
				var $thisArea = $(this).closest('.geography__areas');

				marker.on('popupopen', function() {
					$(this._popup._container).css('left', '-240px');
					map.setZoom(13);
					map.setView(marker._latlng);

					var $region = $thisTarget.closest('.geography__region');
					if (!$region.hasClass('geography__region--active')) {
						$('.geography__region--active').find('.geography__areas').slideUp();
						$('.geography__region--active').removeClass('geography__region--active');
						$region.addClass('geography__region--active');
						$thisArea.slideDown();
					}
				})

				$(this).click(function() {
					marker.openPopup();
					$('html, body').animate({
						scrollTop: $("#geo-map").offset().top
					}, 1000);
				})
			})
	    });
	}
	if ($('#geo-map').length) geoMap();

	var geographyList = function() {
		$('.geography__region-name').click(function() {
			var $parent = $(this).parent();

			if ($parent.hasClass('geography__region--active')) {
				$parent.removeClass('geography__region--active');
				$parent.find('.geography__areas').slideUp();
			} else {
				$('.geography__region--active').find('.geography__areas').slideUp();
				$('.geography__region--active').removeClass('geography__region--active');
				$('.geography__area--active').find('.geography__targets').slideUp();
				$('.geography__area--active').removeClass('geography__area--active');

				$parent.addClass('geography__region--active');
				$parent.find('.geography__areas').slideDown();
			}
		})

		$('.geography__area-name').click(function() {
			var $parent = $(this).parent();

			if (!$parent.hasClass('geography__area--target')) {
				if ($parent.hasClass('geography__area--active')) {
					$parent.removeClass('geography__area--active');
					$parent.find('.geography__targets').slideUp();
				} else {
					$('.geography__area--active').find('.geography__targets').slideUp();
					$('.geography__area--active').removeClass('geography__area--active');

					$parent.addClass('geography__area--active');
					$parent.find('.geography__targets').slideDown();
				}
			}
		})
	}();

	var openModals = function() {
		$('#open-auth').click(function() {
			$('.modal__close').trigger('click');

			$('#auth-container').addClass('modal-container--active');
			$('#auth').addClass('modal--active');
			$('.modal-overlay').addClass('modal-overlay--active');
			$('#auth #login').focus();
		})

		$('#open-registration').click(function() {
			$('.modal__close').trigger('click');

			$('#registration-container').addClass('modal-container--active');
			$('#registration').addClass('modal--active');
			$('.modal-overlay').addClass('modal-overlay--active');
			$('#registration #r_login').focus();
		})

		$('#open-callback').click(function() {
			$('.modal__close').trigger('click');

			$('#callback-container').addClass('modal-container--active');
			$('#callback').addClass('modal--active');
			$('.modal-overlay').addClass('modal-overlay--active');
			$('#callback #callback-name').focus();
		})

		$('#open-reset').click(function() {
			$('.modal__close').trigger('click');

			$('#reset-container').addClass('modal-container--active');
			$('#reset').addClass('modal--active');
			$('.modal-overlay').addClass('modal-overlay--active');
			$('#reset #reset-login').focus();
		})

		$('.modal__close').click(function() {
			$('.modal--active').removeClass('modal--active');
			$('.modal-container--active').removeClass('modal-container--active');
			$('.modal-overlay--active').removeClass('modal-overlay--active');
		})

		$('.btn--close-modal').click(function() {
			$('.modal__close').trigger('click');
		})

		$('.modal-container').click(function(e) {
			if ($(this).hasClass('modal-container--active') && !$(e.target).hasClass('modal')) $('.modal__close').trigger('click');
		})
	}()

	var chooseCity = function() {
		$('#open-choose-city').click(function() {
			$('#choose-city').toggleClass('cities--active');
			$(this).toggleClass('header__text--active');
		})

		$('#m_open-choose-city').click(function() {
			$('#m_choose-city').toggleClass('cities--active');
			$(this).toggleClass('header__text--active');
			$('.sub-menu-overlay--mobile').toggleClass('sub-menu-overlay--active');
		})
	}()

	var closeSubMenu = function() {
		$('.main-menu__link--has-child').click(function(e) {
			var $menuItem = $(this).closest('.main-menu__item');
			var $subMenu = $menuItem.find('.sub-menu-wrap');

			if ($menuItem.hasClass('main-menu__item--active')) {
				$menuItem.removeClass('main-menu__item--active');
				$subMenu.removeClass('sub-menu-wrap--active');
				$('.sub-menu-overlay').removeClass('sub-menu-overlay--active');
			} else {
				$('.sub-menu-wrap--active').removeClass('sub-menu-wrap--active');
				$('.main-menu__item--active').removeClass('main-menu__item--active');

				$('.sub-menu-overlay').addClass('sub-menu-overlay--active');
				$menuItem.addClass('main-menu__item--active');
				$subMenu.addClass('sub-menu-wrap--active');
			}
		})

		$('.sub-menu-wrap__close').click(function() {
			var $menuItem = $(this).closest('.main-menu__item');
			var $subMenu = $menuItem.find('.sub-menu-wrap');

			$subMenu.removeClass('sub-menu-wrap--active');
			$menuItem.removeClass('main-menu__item--active');
			$('.sub-menu-overlay').removeClass('sub-menu-overlay--active');
		})
	}()

	var upButton = function() {
		var upOffsetTop = $('.up-wrap').offset().top - $(window).outerHeight();
		var $up = $('.up-wrap');

		$(window).scroll(function() {
			if ($(this).scrollTop() >= upOffsetTop || $(this).scrollTop() < ($(this).outerHeight() / 2)) {
				$up.removeClass('up-wrap--fixed');
			} else {
				if ($(this).scrollTop() > ($(this).outerHeight() / 2)) $up.addClass('up-wrap--fixed');
			}
		})

		$(window).resize(function() {
			upOffsetTop = $('.up-wrap').offset().top - $(window).outerHeight();
			$(this).trigger('scroll');
		})

		$("#go-up").click(function (){
            $('html, body').animate({
                scrollTop: $('header').offset().top
            }, 500);
        });
	}
	if ($('#go-up').length) upButton();

	var mobileMenu = function() {
		$('#show-mobile-menu').click(function() {
			$(this).toggleClass('m_nav__show--active');
			$('#mobile-menu').toggleClass('l_m_menu--active');
			$('.sub-menu-overlay--mobile').toggleClass('sub-menu-overlay--active');
		})

		$('span.m_menu-item__name').click(function() {
			$parent = $(this).parent();

			if ($parent.hasClass('m_menu-item--active')) {
				$parent.removeClass('m_menu-item--active');
				$parent.find('.m_menu').slideUp();
			} else {
				if (!$(this).hasClass('m_menu-item__name--second') && $('.m_menu-item--active').length) {
					console.log('asd');
					$activeMenu = $('.m_menu-item--active');
					$activeMenu.find('.m_menu').slideUp();
					$activeMenu.removeClass('m_menu-item--active');
				}

				if ($(this).hasClass('m_menu-item__name--second')) {
					$activeMenu = $('.m_menu-item--second.m_menu-item--active');
					$activeMenu.find('.m_menu--sub-sub').slideUp();
					$activeMenu.removeClass('m_menu-item--active');
				}

				$parent.addClass('m_menu-item--active');
				$(this).next().slideDown();
			}
		})

		$(window).scroll(function() {
			var menuOffsetAndHeight = $('#mobile-menu').offset().top + $('#mobile-menu').outerHeight();

			if ($('#mobile-menu').hasClass('l_m_menu--active') && $(this).scrollTop() > menuOffsetAndHeight) {
				$('#show-mobile-menu').trigger('click');
				$activeMenu = $('.m_menu-item--active');
				$activeMenu.find('.m_menu').slideUp();
				$activeMenu.removeClass('m_menu-item--active');
			}
		})
	}()

	var serviceTeaser = function() {
		$('span.service-teaser__link').click(function() {
			var $list = $(this).closest('.service-teaser').find('.service-teaser__sub-list');
			if (!$(this).hasClass('service-teaser--active')) {
				$('.service-teaser--active').removeClass('service-teaser--active');
				$('.service-teaser__sub-list').slideUp();
				$(this).addClass('service-teaser--active');
				$list.slideDown();
			} else {
				$(this).removeClass('service-teaser--active');
				$list.slideUp();
			}
		})
	}()

	var paymentForm = function() {
		$('#show-payment-form').click(function() {
			$('#payment-form').slideDown(function() {
				$($('.payment__form').find('input')[0]).focus();
			});
			$(this).fadeOut(function() {
				$('#hide-payment-form').fadeIn();
			})
		})

		$('#hide-payment-form').click(function() {
			$('#payment-form').slideUp();
			$(this).fadeOut(function() {
				$('#show-payment-form').fadeIn();
			})
		})
	}()

	var serviceMenu = function() {
			$('.service-menu__name--active + .service-menu__sub').slideDown();

			$('.service-menu__name').click(function() {
				var $menuItem = $(this).closest('.service-menu__item');
				var $menuItemName = $(this);
				if ($(this).hasClass('service-menu__name--active')) {
					$menuItem.find('.service-menu__sub').slideUp();
					$menuItemName.removeClass('service-menu__name--active')
				} else {
					$('.service-menu__sub').slideUp();
					$('span.service-menu__name--active').removeClass('service-menu__name--active');

					$menuItem.find('.service-menu__sub').slideDown();
					$menuItemName.addClass('service-menu__name--active');
				}
			})
	}()

	$('body').click(function(e) {
		var $target = $(e.target);

		if ($('#choose-city').hasClass('cities--active') && !$target.hasClass('header__text--city') && !$target.hasClass('cities--active')) {
			$('#choose-city').removeClass('cities--active');
			$('#open-choose-city').removeClass('header__text--active');
		}

		if ($('.sub-menu-wrap').hasClass('sub-menu-wrap--active') && !$target.hasClass('main-menu__link--has-child') &&!$target.hasClass('sub-menu-wrap--active')) {
			$('.sub-menu-wrap--active').removeClass('sub-menu-wrap--active');
			$('.main-menu__item--active').removeClass('main-menu__item--active');
			$('.sub-menu-overlay').removeClass('sub-menu-overlay--active');
		}
	})

	$('.cities').click(function() {event.stopPropagation()})
	$('.header__text--city').click(function() {event.stopPropagation()})
	$('.sub-menu-wrap').click(function() {event.stopPropagation()})
	$('.main-menu__link--has-child').click(function() {event.stopPropagation()})
	$('.modal').click(function() {event.stopPropagation()})
})
