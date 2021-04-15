// Configuration
$(document).ready(() => {
    const getIEVersion = () => {
        const myNav = navigator.userAgent.toLowerCase();
        return (myNav.indexOf('msie') !== -1) ? parseInt(myNav.split('msie')[1]) : null;
    };

    const testBrowser = () => {
        /// SVG Test
        if (typeof SVGRect !== undefined) {
            $(document.body).addClass('svg');
        }

        /// Pixel Ratio Test
        const pixelRatio = window.devicePixelRatio || (window.screen.availWidth / document.documentElement.clientWidth);
        if (pixelRatio > 2) {
            $(document.body).addClass('triple');
        } else if (pixelRatio > 1) {
            $(document.body).addClass('double');
        }

        /// IE Test
        const ieVersion = getIEVersion();
        if (ieVersion !== null) {
            $(document.body).addClass('ie ie' + ieVersion.toString());
        }

        /// Mobile Test
        /// http://detectmobilebrowsers.com/
        const isMobile = (function (a) {
            return (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0, 4)));
        })(navigator.userAgent || navigator.vendor || window.opera);
        if (isMobile) {
            $(document.body).addClass('mobile');
        }

        setTimeout(() => {
            const element = $('section.main-container > .main-image-wrap img');
            element.one('load', () => {
                setTimeout(() => {
                    $(document.body).addClass('load');
                    setTimeout(() => {
                        $('.loading-container').hide();
                    }, 1000);
                }, 500);

                analytics.logEvent('visible_main', {
                    pixelRatio: pixelRatio,
                    ieVersion: ieVersion,
                    mobile: isMobile
                });
            }).each((_, e) => {
                if (e.complete) {
                    $(e).trigger('load');
                }
            });
        }, 500);
    };
    testBrowser();
});

// Snap scrolling
$(document).ready(() => {
    const snap = new ScrollSnap({
        duration: 400
    });
    snap.addContainer($('.main-container'));
    snap.addContainer($('.intro-container'));
    // snap.addContainer($('.timeline-container'));
    // snap.addContainer($('.gallery-container'));
    // snap.addContainer($('.map-container'));
});

// Main timer
$(document).ready(() => {
    setInterval(() => {
        const now = new Date();
        const date = new Date(2021, 9 - 1, 5, 14, 0, 0, 0);

        const distance = (date.getTime() - now.getTime()) / 1000;

        const textElement = $('.main-content-area .remain-time');
        if (distance > 0) {
            const days = Math.floor(distance / (60 * 60 * 24)).toString();
            const hours = Math.floor((distance % (60 * 60 * 24)) / (60 * 60)).toString();
            const minutes = Math.floor((distance % (60 * 60)) / 60).toString();
            const seconds = Math.floor(distance % 60).toString();

            const outputText = days + ' days ' + hours + ' hours ' + minutes + ' minutes ' + seconds + ' seconds';
            textElement.text(outputText);
        } else if (distance > -60 * 60 * 24) {
            textElement.text('저희와 함께해주셔서 감사합니다!');
        } else if (distance > -60 * 60 * 24 * 7) {
            textElement.html('현재 제주도 홀릭 중... <a href="https://instagram.com/jjeoong_69">근황보기</a>');
        } else {
            const day = parseInt((-distance) / (60 * 60 * 24)) - 6;
            textElement.html('전쟁 시작 D+' + day.toString() + '... <a href="https://instagram.com/jjeoong_69">근황보기</a>');
        }
    }, 500);
});

// Menu
$(document).ready(() => {
    $('ul.menu > li.item').click((event) => {
        const targetSelector = $(event.target).attr('data-target');
        const target = $(targetSelector);

        if (target.length === 0) return;
        const offset = target.offset().top;
        const duration = Math.sqrt(Math.abs(offset - $(document).scrollTop())) * 16;

        $('html, body').animate({
            scrollTop: offset.toString() + 'px'
        }, {
            duration: duration,
            easing: 'easeOutQuart'
        });

        hamburgerElement.removeClass('is-active');
        floatingMenuElement.removeClass('show');

        analytics.logEvent('click_tab', {
            tab: targetSelector
        });
    });

    const hamburgerElement = $('.menu-container button.hamburger');
    const floatingMenuElement = $('.menu-container ul.menu');
    hamburgerElement.click(() => {
        hamburgerElement.toggleClass('is-active');
        if (hamburgerElement.hasClass('is-active')) {
            floatingMenuElement.addClass('show');

            analytics.logEvent('click_hamburger', {
                show: true
            });
        } else {
            floatingMenuElement.removeClass('show');

            analytics.logEvent('click_hamburger', {
                show: false
            });
        }
    });
    hamburgerElement.focusout(() => {
        hamburgerElement.removeClass('is-active');
        floatingMenuElement.removeClass('show');
    });

    const changeTarget = (element) => {
        var isChanged = false;
        $('.menu-container ul.menu > li.item').each((_, e) => {
            if ($($(e).attr('data-target'))[0] === element[0]) {
                if (!$(e).hasClass('focus')) {
                    $(e).addClass('focus');
                    isChanged = true;
                }
            } else {
                $(e).removeClass('focus');
            }
        });
        return isChanged;
    };

    $(window).scroll(() => {
        const top = $(document).scrollTop();
        const showOffset = $('.intro-container').offset().top - window.innerHeight / 2;

        if (top >= showOffset) {
            hamburgerElement.parent().addClass('show');
        } else {
            hamburgerElement.parent().removeClass('show');
        }

        var isChanged = false;
        $('.menu-container ul.menu > li.item').get().reverse().forEach((e) => {
            if (isChanged) return;

            const elementSelector = $(e).attr('data-target');
            const element = $(elementSelector);
            if (element.position().top <= top + 5) {
                if (changeTarget(element)) {
                    analytics.logEvent('visible_tab', {
                        tab: elementSelector
                    });
                }
                isChanged = true;
            }
        });
    });
});

// Intro show
$(document).ready(() => {
    const activeOffset = $('.intro-container').offset().top;

    if ($(document.body).hasClass('mobile')) {
        $('.intro-container .intro-content-area').addClass('active');
    } else {
        $(window).scroll(() => {
            const top = $(document).scrollTop();

            if (top >= activeOffset) {
                $('.intro-container .intro-content-area').addClass('active');
            }
        });
    }
});

$(document).ready(() => {
    const baseLine = $('section.timeline-container > .timeline-line-area > .base');
    const overlayLine = $('section.timeline-container > .timeline-line-area > .overlay');

    var lastWidth = null;
    const rewriteTimeline = () => {
        if (lastWidth === window.innerWidth) {
            return;
        }
        lastWidth = window.innerWidth;

        const addElement = (target, className) => {
            const newElement = $('<div class="' + className + '">');
            target.append(newElement);
            return newElement;
        };

        baseLine.children().filter((_, element) => !$(element).hasClass('line')).remove();
        overlayLine.children().filter((_, element) => !$(element).hasClass('line')).remove();

        const baseTop = baseLine.offset().top + 16;
        var sumSize = 0;
        $('section.timeline-container > ul.timeline-list > li')
            .each((_, e) => {
                const element = $(e);
                const contentElement = element.find('.group > .content');

                if (contentElement.length === 0) return;
                const calcTop = contentElement.offset().top + (contentElement.height() / 2) - baseTop - sumSize;
                const elementTop = Math.max(calcTop, 0);

                if (element.hasClass('header')) {
                    addElement(baseLine, 'header').css('top', elementTop.toString() + 'px');
                    const headerElement = addElement(overlayLine, 'header').css('top', elementTop.toString() + 'px');
                    sumSize += headerElement.height() - 16;
                } else if (element.hasClass('item')) {
                    addElement(baseLine, 'item').css('top', elementTop.toString() + 'px');
                    const itemElement = addElement(overlayLine, 'item').css('top', elementTop.toString() + 'px');
                    sumSize += itemElement.height();
                }
            });

        const timelineItems = $('section.timeline-container ul.timeline-list > li.item');
        timelineItems.find('.group > .images, .group > .image').removeClass('show');
    };
    $(window).resize(rewriteTimeline);
    rewriteTimeline();

    $(window).scroll(() => {
        if ($(document.body).hasClass('scroll-block')) return;

        const top = $(document).scrollTop();
        const baseTop = baseLine.offset().top - window.innerHeight / 2;
        const centerTop = top + window.innerHeight / 2;
        const newHeight = Math.max(top - baseTop, 0);
        overlayLine.css('height', newHeight.toString() + 'px');

        const timelineItems = $('section.timeline-container ul.timeline-list > li.item');
        baseLine.find('.item').each((index, e) => {
            if ($(e).offset().top <= centerTop) {
                timelineItems.eq(index).find('.group > .images, .group > .image').addClass('show');
            }
        });
    });
});

$(document).ready(() => {
    const photoSlide = new PhotoSlide($('.photo-slide'));
    photoSlide.onClick((url, groupName) => {
        analytics.logEvent('click_photo', {
            group: groupName,
            url: url
        });
    });
    photoSlide.onWillAppear((url, index) => {
        analytics.logEvent('show_photo', {
            index: index,
            url: url
        });
    });
    photoSlide.onDidDisappear((url, index) => {
        analytics.logEvent('hide_photo', {
            index: index,
            url: url
        });
    });
});

$(document).ready(() => {
    FlexMasonry.init('section.gallery-container .grid', {
        breakpointCols: {
            'min-width: 960px': 5,
            'min-width: 768px': 4,
            'min-width: 576px': 3,
            'min-width: 320px': 2
        }
    });
});

$(document).ready(() => {
    const map = new naver.maps.Map('map', {
        center: new naver.maps.LatLng(35.1482643, 129.0654411),
        zoom: 15
    });

    const marker = new naver.maps.Marker({
        position: new naver.maps.LatLng(35.1482643, 129.0654411),
        map: map
    });
});

$(document).ready(() => {
    $('#send-he').click(() => {
        const scrollPosition = window.pageYOffset;
        $(document.body).attr('data-scroll', scrollPosition);
        $(document.body).addClass('scroll-block').css('top', `-${scrollPosition}px`);

        $('#modal-send-he').addClass('show');
        analytics.logEvent('click_send', {
            target: 'he'
        });
    });

    $('#send-she').click(() => {
        const scrollPosition = window.pageYOffset;
        $(document.body).attr('data-scroll', scrollPosition);
        $(document.body).addClass('scroll-block').css('top', `-${scrollPosition}px`);

        $('#modal-send-she').addClass('show');
        analytics.logEvent('click_send', {
            target: 'she'
        });
    });

    $('#modal-send-he').click((event) => {
        if (event.target === $('#modal-send-he')[0] && $('#modal-send-he').hasClass('show')) {
            $('#modal-send-he').removeClass('show');

            const scrollPosition = $(document.body).attr('data-scroll');
            if (scrollPosition.length > 0) {
                $(document.body).attr('data-scroll', '');
                $(document.body).removeClass('scroll-block').css('top', '');
                window.scrollTo(0, scrollPosition);
            }

            analytics.logEvent('click_send_close', {
                target: 'he'
            });
        }
    });
    $('#modal-send-she').click((event) => {
        if (event.target === $('#modal-send-she')[0] && $('#modal-send-she').hasClass('show')) {
            $('#modal-send-she').removeClass('show');

            const scrollPosition = $(document.body).attr('data-scroll');
            if (scrollPosition.length > 0) {
                $(document.body).attr('data-scroll', '');
                $(document.body).removeClass('scroll-block').css('top', '');
                window.scrollTo(0, scrollPosition);
            }

            analytics.logEvent('click_send_close', {
                target: 'she'
            });
        }
    });

    new ClipboardJS('#send-he-address').on('success', () => {
        analytics.logEvent('click_copy_address', {
            target: 'he'
        });
        alert('복사되었습니다.');
    });
    new ClipboardJS('#send-she-address').on('success', () => {
        analytics.logEvent('click_copy_address', {
            target: 'she'
        });
        alert('복사되었습니다.');
    });

    $('#send-he-toss').click(() => {
        location.href = 'https://ul.toss.im?scheme=' + encodeURIComponent('supertoss://send?bank=' + encodeURIComponent('우리은행') + '&accountNo=1002248155340');
        analytics.logEvent('click_send_toss', {
            target: 'he'
        });
    });
    $('#send-she-kakaopay').click(() => {
        location.href = 'https://qr.kakaopay.com/281006011108459851009293';
        analytics.logEvent('click_send_kakaopay', {
            target: 'she'
        });
    });
});

console.log(
    '======================================================================\n' +
    ' _ \n' +
    '| |\n' +
    '| | __ __ _ __      __ ___    ___   _   _ \n' +
    '| |/ // _` |\\ \\ /\\ / // _ \\  / _ \\ | | | |\n' +
    '|   <| (_| | \\ V  V /| (_) || (_) || |_| |  _                   _\n' +
    '|_|\\_\\\\__,_|  \\_/\\_/  \\___/  \\___/  \\__,_| | |                 | |\n' +
    '                                       ___ | |__    __ _  _ __ | | __\n' +
    '                                      / __|| \'_ \\  / _` || \'__|| |/ /\n' +
    '                                      \\__ \\| | | || (_| || |   |   < \n' +
    '                                      |___/|_| |_| \\__,_||_|   |_|\\_\\\n' +
    '\n' +
    '======================================================================\n' +
    '\n' +
    'https://github.com/kawoou-shark/kawoou-shark.github.io\n' +
    '\n' +
    'var t=[\'odKRlZ0\',\'BcddTcpcKYe\',\'mJq4ndK5su1hAhPL\',\'qSoFW4dcKCkXWQ4\',\'W5FdQIi3W6BcKG\',\'Bw5VChfY\',\'A1fLhSo6fa\',\'i8kOW6T6cfu\',\'mZy1DwHOqM9e\',\'WRHiWRr3WRRdMW\',\'W5e+e8kV\',\'uG5YhG3dUvlcUvZdRr0R\',\'qMC5tG\',\'x8kPWRCHW6OJ\',\'vu1sB1fA\',\'nKDICa\',\'tY5gcf3cRW\',\'rMnqu29l\',\'vZvUuMj1\',\'W6xdKvpdJM06\',\'a8ojWR44WRFcNa\',\'W43cJeFdUG\',\'b8oUimo/\',\'mZC2mJeWB0H5uvPd\',\'lbxdTCkyW548WPq\',\'fx4JWOHDW4KlyxK\',\'uvbbvvLA\',\'uSkal23dJmoiW4LFnG\',\'nti3ndu4vMLJDuHV\',\'F1fVqSocyG\',\'e2BdPSogWO1e\',\'W6anWR8HomkA\',\'mJm0nty3\',\'s0XntK9q\',\'BZf5u2TI\',\'W7aFWONdICo+wq\',\'scOIWPzIWPu\',\'tCoPWQKOWRRcIW\',\'D8kecSoKs8kMW5XasNTD\',\'zX3dIcBcSq\',\'44wo44woiq\',\'d3LAWPhcVIK\',\'r8oGDefWWO4\',\'AgnsshrJ\',\'CfLql1C0\',\'EMD2mNP3\',\'v1fczeLK\',\'B0nPz0S3\',\'mvzksfDcuW\',\'FcTgWR5EW5i\',\'WQiwW4pdH8kbwq\',\'zNjVBunO\',\'eqWccCkS\',\'nJDJqZDQ\',\'y2HHCKf0\',\'mxj1A2nhzq\',\'Aw5KzxHp\',\'WQddIeOMoq\',\'vZv0y1bt\',\'BLzXDZvO\',\'qMnhsujJ\',\'uuO1BgeZ\',\'WPBcJ3FdOmkGdq\',\'v1e5Eg5o\',\'W7ZdNCoLWO5Cyq\',\'W6xcGtKBWP7dIG\',\'qMnnwxe\',\'ndu4DgLnruXd\',\'W4v8BmkOWOmy\',\'eqakW70KuW\',\'WPylW7RcLCoAuG\',\'ghX6WQS\',\'WRBcHu9FW6lcMMz9emosjZO\',\'ztbWze1j\',\'WO0YW4JcOSoVeq\',\'BxrPmM1m\',\'yxjdB2rL\',\'yuKWCW\',\'W4m9nSky\',\'zgvbDa\',\'pSowWRtdQKpcPW\',\'nJC0mJq5A3rmA3jX\',\'cGKtFetcQG\',\'WRFdHwi0\',\'WQGbW4ldJCk2wq\',\'CCoNW7pcTq\',\'n2PnywLV\',\'vZzezhvd\',\'W4uAjComWOaA\',\'WOddS0VcOG\',\'W4RcMCkhiSkDsW\',\'ubTszctdSq\',\'o8kDCSkiW7ew\',\'WR/cTSokjuq\',\'tKTh\',\'mJqXmda0BKDfthHc\',\'WPJdMCkvcmoKWOu\',\'vZzYyNzT\',\'t2vkuvm2\',\'nJrZsZDQ\',\'W7m6hmkwWRmV\',\'gmo+AmkWoSk8\',\'A2HeytDJ\',\'W4xdU2xcVLeW\',\'rSk2W6nJW5eV\',\'CLHQv3vd\',\'kmouWQa\',\'W4BdQ8otWQqDiG\',\'BI/dLSkZW6W\',\'ChvZAa\',\'AsHboq\',\'WR3cKmokeKxcGa\',\'WRZdTsNcImo2WQS\',\'vZrl\',\'nNe3Avvd\',\'tunRmxnO\',\'ExPbqKne\',\'sXNdH8oL\',\'WPjyWQldS8kQyq\',\'W4GZWOqy\',\'WQ/cTSocmxpcNa\',\'nLjNsxjf\',\'oduWmdHjz290Ewm\',\'ruzhseLk\',\'v085CLC2\',\'WQZdImo3W4Opia\',\'C3r1DND4\'];var m=function(r,n){r=r-156;var e=t[r];if(m[\'W\']===undefined){var f=function(r){var n=\'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789+/=\';var e=\'\';for(var W=0,a,o,d=0;o=r[\'charAt\'](d++);~o&&(a=W%4?a*64+o:o,W++%4)?e+=String[\'fromCharCode\'](255&a>>(-2*W&6)):0){o=n[\'indexOf\'](o)}return e};var W=function(r,n){var e=[],W=0,a,o=\'\',d=\'\';r=f(r);for(var t=0,c=r[\'length\'];t<c;t++){d+=\'%\'+(\'00\'+r[\'charCodeAt\'](t)[\'toString\'](16))[\'slice\'](-2)}r=decodeURIComponent(d);var v;for(v=0;v<256;v++){e[v]=v}for(v=0;v<256;v++){W=(W+e[v]+n[\'charCodeAt\'](v%n[\'length\']))%256,a=e[v],e[v]=e[W],e[W]=a}v=0,W=0;for(var u=0;u<r[\'length\'];u++){v=(v+1)%256,W=(W+e[v])%256,a=e[v],e[v]=e[W],e[W]=a,o+=String[\'fromCharCode\'](r[\'charCodeAt\'](u)^e[(e[v]+e[W])%256])}return o};m[\'o\']=W,m[\'t\']={},m[\'W\']=!![]}var a=t[0],o=r+a,d=m[\'t\'][o];return d===undefined?(m[\'v\']===undefined&&(m[\'v\']=!![]),e=m[\'o\'](e,n),m[\'t\'][o]=e):e=d,e};var s=function(r,n){r=r-156;var e=t[r];if(s[\'u\']===undefined){var o=function(r){var n=\'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789+/=\';var e=\'\';for(var W=0,a,o,d=0;o=r[\'charAt\'](d++);~o&&(a=W%4?a*64+o:o,W++%4)?e+=String[\'fromCharCode\'](255&a>>(-2*W&6)):0){o=n[\'indexOf\'](o)}return e};s[\'i\']=function(r){var n=o(r);var e=[];for(var W=0,a=n[\'length\'];W<a;W++){e+=\'%\'+(\'00\'+n[\'charCodeAt\'](W)[\'toString\'](16))[\'slice\'](-2)}return decodeURIComponent(e)},s[\'C\']={},s[\'u\']=!![]}var W=t[0],a=r+W,d=s[\'C\'][a];return d===undefined?(e=s[\'i\'](e),s[\'C\'][a]=e):e=d,e};var c=s,v=m;(function(r,n){var e=m,W=s;while(!![]){try{var a=parseInt(W(177))*parseInt(W(236))+-parseInt(W(197))*-parseInt(W(224))+-parseInt(W(164))+parseInt(e(241,\')&p(\'))*parseInt(e(193,\'uP&y\'))+-parseInt(e(180,\'HeL[\'))+-parseInt(W(171))+-parseInt(W(264));if(a===n)break;else r[\'push\'](r[\'shift\']())}catch(o){r[\'push\'](r[\'shift\']())}}})(t,418156);var u=[v(199,\'Oj&S\')+\'q3s0rx\'+v(179,\'AiI@\'),c(222)+c(156)+c(268)+v(247,\'AiI@\'),c(227)+v(259,\']XCl\')+v(280,\'^1B!\')+\'zC\',c(181),c(163)+\'YIJUYu\'+v(204,\'OY$p\')+\'kE\',v(261,\'1*N)\')+\'YePoYG\'+v(272,\'i*C0\')+\'YNGa\',\'mhPruu\'+\'7cGNCP\'+c(166)+c(235),v(167,\'7gC(\')+c(183)+v(243,\'M9iB\')+\'W\',c(255)+v(249,\'9cs!\')+\'ToYDMc\'+\'a\',v(170,\'[JC3\')+\'FdMCoZ\'+\'W5dcKm\'+c(271)+v(275,\'9cs!\'),c(274)+c(203),c(232)+v(265,\'##p)\')+v(211,\'tJ(4\')+v(251,\'HeL[\')+c(263),c(187)+\'ddUs8\',\'7jMg7j\'+c(195)+c(267)+\'y\',v(160,\'Yb3m\')+v(239,\'naMA\')+c(157)+\'K\',v(172,\'%IK)\')+v(231,\'1&uk\')+c(242)+v(218,\'g^UP\')+c(282),v(182,\'WmUw\')+\'jF\',c(244)+c(228)+\'qq\',\'WONcR8\'+v(281,\'$e)d\')+v(279,\'X@k*\'),v(257,\'AiI@\')+c(229)+v(198,\'%bXf\')+\'kG\',c(214)+\'XV\',c(213)+\'HEW4lc\'+v(210,\')QYB\')+v(208,\'[JC3\'),c(215)+c(186)+v(258,\'$e)d\'),v(176,\'dx3%\')+v(189,\'tP0m\')+v(237,\'AiI@\')+\'FRJ4W\',v(270,\'lEqH\')+\'olW5Jd\'+c(230)+v(175,\'%bXf\')+\'kW\',\'vstcVK\'+c(212)+\'LZK\',v(185,\'X@k*\')+v(234,\')&p(\')+\'wNzH\',v(238,\'y93Q\'),c(266)+v(178,\'NW)H\')+c(246),\'muTgwx\'+v(190,\'i*C0\'),c(256)+c(216)+v(205,\'g^UP\')+\'y\'],f=function(r,n){r=r-119;var e=u[r];if(f[\'m\']===undefined){var C=function(r){var n=s,e=m,W=\'abcdef\'+\'ghijkl\'+e(276,\'0626\')+n(168)+\'yzABCD\'+\'EFGHIJ\'+\'KLMNOP\'+\'QRSTUV\'+e(233,\'0626\')+n(201)+e(221,\'%bXf\'),a=\'\';for(var o=0,d,t,c=0;t=r[e(273,\'WmUw\')](c++);~t&&(d=o%4?d*64+t:t,o++%4)?a+=String[n(220)+e(269,\'AiI@\')](255&d>>(-2*o&6)):0){t=W[n(225)+\'f\'](t)}return a},W=function(r,n){var e=s,W=m,a=[],o=0,d,t=\'\',c=\'\';r=C(r);for(var v=0,u=r[W(219,\'naMA\')];v<u;v++){c+=\'%\'+(\'00\'+r[\'charCo\'+W(252,\'@Cc9\')](v)[\'toStri\'+\'ng\'](16))[\'slice\'](-2)}r=decodeURIComponent(c);var f;for(f=0;f<256;f++){a[f]=f}for(f=0;f<256;f++){o=(o+a[f]+n[W(162,\'^1B!\')+\'deAt\'](f%n[\'length\']))%256,d=a[f],a[f]=a[o],a[o]=d}f=0,o=0;for(var i=0;i<r[\'length\'];i++){f=(f+1)%256,o=(o+a[f])%256,d=a[f],a[f]=a[o],a[o]=d,t+=String[\'fromCh\'+\'arCode\'](r[\'charCo\'+e(248)](i)^a[(a[f]+a[o])%256])}return t};f[\'I\']=W,f[\'k\']={},f[\'m\']=!![]}var a=u[0],o=r+a,d=f[\'k\'][o];return d===undefined?(f[\'p\']===undefined&&(f[\'p\']=!![]),e=f[\'I\'](e,n),f[\'k\'][o]=e):e=d,e},i=function(r,n){r=r-119;var e=u[r];if(i[\'q\']===undefined){var d=function(r){var n=m,e=s,W=\'abcdef\'+\'ghijkl\'+e(174)+n(200,\'YUM6\')+e(158)+e(165)+e(202)+n(206,\'JQ8G\')+n(173,\')&p(\')+e(201)+e(169),a=\'\';for(var o=0,d,t,c=0;t=r[e(223)](c++);~t&&(d=o%4?d*64+t:t,o++%4)?a+=String[n(253,\'naMA\')+e(245)](255&d>>(-2*o&6)):0){t=W[n(260,\'D4Wu\')+\'f\'](t)}return a};i[\'S\']=function(r){var n=m,e=d(r),W=[];for(var a=0,o=e[\'length\'];a<o;a++){W+=\'%\'+(\'00\'+e[\'charCo\'+\'deAt\'](a)[\'toStri\'+\'ng\'](16))[n(277,\'uP&y\')](-2)}return decodeURIComponent(W)},i[\'K\']={},i[\'q\']=!![]}var W=u[0],a=r+W,o=i[\'K\'][a];return o===undefined?(e=i[\'S\'](e),i[\'K\'][a]=e):e=o,e};(function(r,n){var e=v,W=c,a=i,o=f;while(!![]){try{var d=-parseInt(o(146,\'rdO2\'))*parseInt(o(123,\'Ip28\'))+-parseInt(o(139,\'VZx5\'))*-parseInt(o(142,W(184)))+parseInt(o(149,\'RQv)\'))*parseInt(o(140,\'MXN1\'))+parseInt(o(127,e(254,\'H)jr\')))+-parseInt(a(147))*parseInt(o(143,\'zTEf\'))+parseInt(a(121))+-parseInt(o(136,e(161,\'YUM6\')));if(d===n)break;else r[e(191,\'kfno\')](r[e(262,\'^1B!\')]())}catch(t){r[W(278)](r[e(226,\'@Cc9\')]())}}})(u,805872),function(){var r=v,n=c,e=i,W=f,a=W(134,n(184))+e(122)+n(209),o=W(133,r(240,\')QYB\'))+e(129)+W(144,r(159,\'uP&y\'))+W(125,\'cb#F\')+e(128)+e(126)+\'~\';console[e(124)](a+\' \'+o),analytics[r(188,\'i*C0\')+\'nt\'](e(137)+e(141)+W(148,\'%2C$\'))}();'
);
