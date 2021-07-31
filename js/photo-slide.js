class PhotoSlide {
    constructor(element) {
        this._onClickCallbacks = [];
        this._onWillAppearCallbacks = [];
        this._onDidAppearCallbacks = [];
        this._onWillDisappearCallbacks = [];
        this._onDidDisappearCallbacks = [];

        const bodyElement = $(document.body);
        const containerElement = $('<div class="_photo-slide-container"></div>');
        bodyElement.append(containerElement);

        const slideElement = $('<div class="slide"></div>');
        containerElement.append(slideElement);

        const slideLeftArrow = $('<div class="arrow-button left"><i class="arrow left"></i></div>');
        containerElement.append(slideLeftArrow);

        const slideRightArrow = $('<div class="arrow-button right"><i class="arrow right"></i></div>');
        containerElement.append(slideRightArrow);

        const closeButton = $('<div class="close-button"><i class="close"></i></div>');
        containerElement.append(closeButton);

        var dict = {};
        $(element).each((index, e) => {
            const element = $(e);
            const groupName = element.attr('data-group');
            const thumbnailElement = element.find('img');

            element.click((event) => {
                const currentImage = $(event.target).parent().attr('href');
                this._onClickCallbacks.forEach((callback) => {
                    if (!!callback) {
                        callback(currentImage, groupName);
                    }
                });
                this._show(containerElement, slideElement, thumbnailElement, dict[groupName], currentImage);

                return false;
            });

            var array = dict[groupName] || [];
            array.push(element.attr('href'));
            dict[groupName] = array;
        });

        this._mc = new Hammer.Manager(containerElement[0], {
            recognizers: [
                [Hammer.Pinch, { enable: true }],
                [Hammer.Pan, { enable: true, direction: Hammer.DIRECTION_ALL }]
            ]
        });

        this._bindDrag(containerElement, slideElement);
        this._bindHide(containerElement, slideElement);
        this._bindButtons(containerElement, slideElement);
        this._bindKeyboard(containerElement, slideElement);
        this._bindPinch(containerElement, slideElement);
    }

    onClick(callback) {
        this._onClickCallbacks.push(callback);
    }
    onWillAppear(callback) {
        this._onWillAppearCallbacks.push(callback);
    }
    onDidAppear(callback) {
        this._onDidAppearCallbacks.push(callback);
    }
    onWillDisappear(callback) {
        this._onWillDisappearCallbacks.push(callback);
    }
    onDidDisappear(callback) {
        this._onDidDisappearCallbacks.push(callback);
    }

    _show(containerElement, slideElement, thumbnailElement, groupImages, currentImage) {
        if (containerElement.hasClass('block') || containerElement.hasClass('show')) return;

        const scrollPosition = window.pageYOffset;
        $(document.body).attr('data-scroll', scrollPosition);
        $(document.body).addClass('scroll-block').css('top', `-${scrollPosition}px`);

        const rect = thumbnailElement[0].getBoundingClientRect();
        containerElement.addClass('block');

        const imageElement = $('<img class="_photo-slide-thumbnail" src="' + thumbnailElement.attr('src') + '" />');
        imageElement.css({
            top: rect.y.toString() + 'px',
            left: rect.x.toString() + 'px',
            width: rect.width.toString() + 'px',
            height: rect.height.toString() + 'px'
        });
        containerElement.append(imageElement);

        setTimeout(() => {
            containerElement.addClass('show');
            this._moveImage(imageElement);

            setTimeout(() => {
                const currentIndex = this._loadGroup(slideElement, groupImages || [], currentImage);
                this._updateButtons(containerElement, slideElement);
                this._deferLoadImage(slideElement, currentIndex);

                const currentImagePath = this._getImageURL(slideElement, currentIndex);
                this._onWillAppearCallbacks.forEach((callback) => {
                    if (!!callback) {
                        callback(currentImagePath, currentIndex);
                    }
                });

                // slideElement.find('.item').eq(currentIndex).find('img').one('load', () => {
                    containerElement.addClass('loaded');
                    imageElement.remove();
                // }).each((_, e) => {
                //     if (e.complete) {
                //         $(e).trigger('load');
                //     }
                // });

                this._onDidAppearCallbacks.forEach((callback) => {
                    if (!!callback) {
                        callback(currentImagePath, currentIndex);
                    }
                });
            }, 500);
        }, 300);
    }

    _hide(containerElement, slideElement) {
        if (!containerElement.hasClass('block') || !containerElement.hasClass('show') || containerElement.hasClass('dragging')) return;

        const currentIndex = slideElement.attr('data-index');
        const currentImagePath = this._getImageURL(slideElement, currentIndex);
        this._onWillDisappearCallbacks.forEach((callback) => {
            if (!!callback) {
                callback(currentImagePath, currentIndex);
            }
        });

        const scrollPosition = $(document.body).attr('data-scroll');
        $(document.body).attr('data-scroll', '');
        $(document.body).removeClass('scroll-block').css('top', '');
        window.scrollTo(0, scrollPosition);

        containerElement.find('._photo-slide-thumbnail').remove();

        containerElement.removeClass('show');
        setTimeout(() => {
            containerElement.removeClass('block').removeClass('loaded');
            slideElement.find('.item').remove();

            this._onDidDisappearCallbacks.forEach((callback) => {
                if (!!callback) {
                    callback(currentImagePath, currentIndex);
                }
            });
        }, 500);
    }

    _loadGroup(slideElement, images, currentImage) {
        slideElement.css('left', '');

        slideElement.find('.item').remove();

        var currentIndex = 0;
        images.forEach((image, index) => {
            if (image === currentImage) {
                currentIndex = index;
            }

            const item = $('<div class="item"><img data-src="' + image + '" /></div>');
            slideElement.append(item);
        });

        slideElement.attr('data-index', currentIndex);
        slideElement.find('.item:nth-child(1)').css('margin-left', `-${currentIndex * 100}%`);
        return currentIndex;
    }

    _moveImage(imageElement) {
        const width = imageElement[0].naturalWidth;
        const height = imageElement[0].naturalHeight;

        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;

        const resizeWidth = width * windowHeight / height;
        const resizeHeight = height * windowWidth / width;

        if (resizeWidth < windowWidth) {
            imageElement.css({
                top: 0,
                left: parseInt((windowWidth - resizeWidth) * 0.5).toString() + 'px',
                width: resizeWidth.toString() + 'px',
                height: windowHeight.toString() + 'px'
            });
        } else {
            imageElement.css({
                top: parseInt((windowHeight - resizeHeight) * 0.5).toString() + 'px',
                left: 0,
                width: windowWidth.toString() + 'px',
                height: resizeHeight.toString() + 'px'
            });
        }
    }

    _bindDrag(containerElement, slideElement) {
        var startX = -1;
        var lastX = -1;
        var startY = -1;
        var lastY = -1;
        var startScale = 1.0;
        var startMoveX = -1;
        var startMoveY = -1;
        var moveDirection = 'NONE';
        var imageElement = null;

        const clamp = (value, min, max) => {
            return Math.min(Math.max(min, value), max);
        };

        this._mc.on('panstart', (event) => {
            const x = event.pointers[0].x;
            const y = event.pointers[0].y;
            if (this._containsImgElement(event.target, x, y)) {
                containerElement.addClass('dragging');

                startX = x;
                lastX = x;
                startY = y;
                lastY = y;
                moveDirection = 'NONE';

                if (containerElement.hasClass('swipe-locked')) {
                    const currentIndex = parseInt(slideElement.attr('data-index'));
                    imageElement = slideElement.find('.item').eq(currentIndex).find('img');
                    startScale = (parseFloat(imageElement.attr('data-scale')) || 1.0);
                    startMoveX = parseInt(imageElement.attr('data-move-x')) || 0;
                    startMoveY = parseInt(imageElement.attr('data-move-y')) || 0;
                }
            }
        });

        this._mc.on('panmove', (event) => {
            if (!containerElement.hasClass('dragging')) return;

            const x = event.pointers[0].x;
            const y = event.pointers[0].y;
            if (Math.abs(x - lastX) > 4) {
                if (x > lastX) {
                    moveDirection = 'LEFT';
                } else {
                    moveDirection = 'RIGHT';
                }
            }
            lastX = x;
            lastY = y;

            const deltaX = x - startX;
            const deltaY = y - startY;
            if (containerElement.hasClass('swipe-locked')) {
                const scale = startScale.toString();
                const rect = imageElement[0].getBoundingClientRect();
                const sizeX = rect.width - $(document.body).width();
                const sizeY = Math.max((rect.width / imageElement[0].naturalWidth * imageElement[0].naturalHeight) - $(document.body).height(), 0);
                const moveX = clamp(startMoveX + deltaX, -sizeX / 2, sizeX / 2);
                const moveY = clamp(startMoveY + deltaY, -sizeY / 2, sizeY / 2);
                
                const cssValue = 'translateX(' + moveX + 'px) translateY(' + moveY + 'px) translateZ(0) scale(' + scale + ', ' + scale + ')';
                imageElement.css('-webkit-transform', cssValue);
                imageElement.css('-moz-transform', cssValue);
                imageElement.css('transform', cssValue);
                imageElement.attr('data-move-x', moveX.toString());
                imageElement.attr('data-move-y', moveY.toString());
                console.log(sizeY, moveY);
            } else {
                if (moveDirection === 'NONE') return;

                const currentIndex = parseInt(slideElement.attr('data-index'))
                slideElement.find('.item').eq(0).removeClass('transition').css({
                    'margin-left': 'calc(' + (-currentIndex * 100).toString() + '% + ' + deltaX.toString() + 'px)'
                });
            }
        });

        this._mc.on('panend pancancel', (event) => {
            if (!containerElement.hasClass('dragging')) return;

            if (containerElement.hasClass('swipe-locked')) {

            } else {
                containerElement.removeClass('dragging');
                switch (moveDirection) {
                    case 'LEFT':
                        if (lastX > startX) {
                            if (this._hasPrev(slideElement)) {
                                this._prev(containerElement, slideElement, true);
                            } else {
                                this._reset(containerElement, slideElement, true);
                            }
                        } else {
                            this._reset(containerElement, slideElement, true);
                        }
                        break;
                    case 'RIGHT':
                        if (lastX > startX) {
                            this._reset(containerElement, slideElement, true);
                        } else {
                            if (this._hasNext(slideElement)) {
                                this._next(containerElement, slideElement, true);
                            } else {
                                this._reset(containerElement, slideElement, true);
                            }
                        }
                        break;
                    default:
                        break;
                }
            }
        });
    }

    _bindHide(containerElement, slideElement) {
        slideElement.click((event) => {
            if (!this._containsImgElement(event.target, event.clientX, event.clientY)) {
                this._hide(containerElement, slideElement);
            }
        });
    }
    _bindButtons(containerElement, slideElement) {
        containerElement.find('.arrow-button.left').click(() => {
            this._prev(containerElement, slideElement);
        });
        containerElement.find('.arrow-button.right').click(() => {
            this._next(containerElement, slideElement);
        });
        containerElement.find('.close-button').click(() => {
            this._hide(containerElement, slideElement);
        });
    }
    _bindKeyboard(containerElement, slideElement) {
        $(document.body).keyup((event) => {
            switch (event.keyCode) {
                case 37:
                    this._prev(containerElement, slideElement);
                    break;
                case 39:
                    this._next(containerElement, slideElement);
                    break;
                case 27:
                    this._hide(containerElement, slideElement);
                default:
                    break;
            }
        });
    }
    _bindPinch(containerElement, slideElement) {
        var imageElement = null;
        var startScale = 1.0;
        var startX = -1;
        var startY = -1;

        const clamp = (value, min, max) => {
            return Math.min(Math.max(min, value), max);
        };

        this._mc.on('pinchstart', (event) => {
            if (containerElement.hasClass('dragging')) {
                containerElement.removeClass('dragging');
                this._reset(containerElement, slideElement, true);
            }

            console.log('pinchstart');
            containerElement.addClass('pinching');
            containerElement.addClass('swipe-locked');

            const currentIndex = parseInt(slideElement.attr('data-index'));
            imageElement = slideElement.find('.item').eq(currentIndex).find('img');
            startScale = (parseFloat(imageElement.attr('data-scale')) || 1.0);
            startX = parseInt(imageElement.attr('data-move-x')) || 0;
            startY = parseInt(imageElement.attr('data-move-y')) || 0;
        });

        this._mc.on('pinchmove', (event) => {
            if (!containerElement.removeClass('pinching')) return;

            const scale = (Math.min(startScale * event.scale, 2.5)).toString();
            var cssValue = 'scale(' + scale + ', ' + scale + ')';
            imageElement.css('-webkit-transform', cssValue);
            imageElement.css('-moz-transform', cssValue);
            imageElement.css('transform', cssValue);
            imageElement.attr('data-scale', scale);

            const rect = imageElement[0].getBoundingClientRect();
            const sizeX = rect.width - $(document.body).width();
            const sizeY = Math.max((rect.width / imageElement[0].naturalWidth * imageElement[0].naturalHeight) - $(document.body).height(), 0);
            const x = clamp(startX + event.deltaX, -sizeX / 2, sizeX / 2);
            const y = clamp(startY + event.deltaY, -sizeY / 2, sizeY / 2);
            cssValue = 'translateX(' + x + 'px) translateY(' + y + 'px) translateZ(0) ' + cssValue;
            imageElement.css('-webkit-transform', cssValue);
            imageElement.css('-moz-transform', cssValue);
            imageElement.css('transform', cssValue);
            imageElement.attr('data-move-x', x.toString());
            imageElement.attr('data-move-y', y.toString());
        });

        this._mc.on('pinchend pinchcancel', (event) => {
            if (!containerElement.removeClass('pinching')) return;

            const scale = (startScale * event.scale).toString();
            if (scale <= 1) {
                imageElement.css('-webkit-transform', '');
                imageElement.css('-moz-transform', '');
                imageElement.css('transform', '');
                imageElement.attr('data-scale', '1');
                imageElement.attr('data-move-x', '0');
                imageElement.attr('data-move-y', '0');
                containerElement.removeClass('swipe-locked');
            } else {
                containerElement.addClass('swipe-locked');
            }
        });
    }

    _hasPrev(slideElement) {
        const currentIndex = parseInt(slideElement.attr('data-index'));
        return currentIndex > 0;
    }
    _hasNext(slideElement) {
        const items = slideElement.find('.item');
        const currentIndex = parseInt(slideElement.attr('data-index'));

        return items.length - 1 > currentIndex;
    }

    _prev(containerElement, slideElement, animated) {
        if (!containerElement.hasClass('block') || !containerElement.hasClass('show') || containerElement.hasClass('dragging')) return;
        containerElement.find('._photo-slide-thumbnail').remove();

        const items = slideElement.find('.item');

        const firstItem = items.eq(0);
        const currentIndex = parseInt(slideElement.attr('data-index'));

        if (this._hasPrev(slideElement)) {
            const prevIndex = currentIndex - 1;
            const prevImagePath = this._getImageURL(slideElement, prevIndex);
            const currentImagePath = this._getImageURL(slideElement, currentIndex);
            this._onWillDisappearCallbacks.forEach((callback) => {
                if (!!callback) {
                    callback(currentImagePath, currentIndex);
                }
            });
            this._onWillAppearCallbacks.forEach((callback) => {
                if (!!callback) {
                    callback(prevImagePath, prevIndex);
                }
            });

            if (animated) {
                firstItem.addClass('transition');
            } else {
                firstItem.removeClass('transition');
            }
            firstItem.css('margin-left', (-prevIndex * 100).toString() + '%');
            slideElement.attr('data-index', prevIndex);

            this._onDidAppearCallbacks.forEach((callback) => {
                if (!!callback) {
                    callback(prevImagePath, prevIndex);
                }
            });
            this._onDidDisappearCallbacks.forEach((callback) => {
                if (!!callback) {
                    callback(currentImagePath, currentIndex);
                }
            });
        }

        this._updateButtons(containerElement, slideElement);
        this._deferLoadImage(slideElement, parseInt(slideElement.attr('data-index')));

        this._resetZoom(slideElement);
    }

    _next(containerElement, slideElement, animated) {
        if (!containerElement.hasClass('block') || !containerElement.hasClass('show') || containerElement.hasClass('dragging')) return;
        containerElement.find('._photo-slide-thumbnail').remove();

        const items = slideElement.find('.item');

        const firstItem = items.eq(0);
        const currentIndex = parseInt(slideElement.attr('data-index'));

        if (this._hasNext(slideElement)) {
            const nextIndex = currentIndex + 1;
            const nextImagePath = this._getImageURL(slideElement, nextIndex);
            const currentImagePath = this._getImageURL(slideElement, currentIndex);
            this._onWillDisappearCallbacks.forEach((callback) => {
                if (!!callback) {
                    callback(currentImagePath, currentIndex);
                }
            });
            this._onWillAppearCallbacks.forEach((callback) => {
                if (!!callback) {
                    callback(nextImagePath, nextIndex);
                }
            });

            if (animated) {
                firstItem.addClass('transition');
            } else {
                firstItem.removeClass('transition');
            }
            firstItem.css('margin-left', (-nextIndex * 100).toString() + '%');
            slideElement.attr('data-index', nextIndex);

            this._onDidAppearCallbacks.forEach((callback) => {
                if (!!callback) {
                    callback(nextImagePath, nextIndex);
                }
            });
            this._onDidDisappearCallbacks.forEach((callback) => {
                if (!!callback) {
                    callback(currentImagePath, currentIndex);
                }
            });
        }

        this._updateButtons(containerElement, slideElement);
        this._deferLoadImage(slideElement, parseInt(slideElement.attr('data-index')));

        this._resetZoom(slideElement);
    }

    _reset(containerElement, slideElement, animated) {
        if (!containerElement.hasClass('block') || !containerElement.hasClass('show') || containerElement.hasClass('dragging')) return;
        containerElement.find('._photo-slide-thumbnail').remove();

        const items = slideElement.find('.item');

        const firstItem = items.eq(0);
        const currentIndex = parseInt(slideElement.attr('data-index'));

        if (animated) {
            firstItem.addClass('transition');
            setTimeout(() => {
                firstItem.removeClass('transition');
            }, 500);
        }
        firstItem.css('margin-left', (-currentIndex * 100).toString() + '%');
        this._updateButtons(containerElement, slideElement);
        this._deferLoadImage(slideElement, currentIndex);

        this._resetZoom(slideElement);
    }

    _resetZoom(slideElement) {
        slideElement.find('.item img')
            .css('-webkit-transform', '')
            .css('-moz-transform', '')
            .css('transform', '')
            .attr('data-scale', '1')
            .attr('data-move-x', '0')
            .attr('data-move-y', '0')
            .removeClass('swipe-locked');
    } 

    _updateButtons(containerElement, slideElement) {
        if (this._hasPrev(slideElement)) {
            containerElement.find('.arrow-button.left').show();
        } else {
            containerElement.find('.arrow-button.left').hide();
        }

        if (this._hasNext(slideElement)) {
            containerElement.find('.arrow-button.right').show();
        } else {
            containerElement.find('.arrow-button.right').hide();
        }
    }

    _containsImgElement(target, x, y) {
        if (target.tagName.toUpperCase() === "DIV" && $(target).hasClass('loading')) {
            return true;
        }
        if (target.tagName.toUpperCase() === "IMG") {
            const width = target.naturalWidth * target.height / target.naturalHeight;
            const left = (window.innerWidth - width) / 2;
            if (x < left || left + width < x) {
                return false;
            }

            const height = target.naturalHeight * target.width / target.naturalWidth;
            const top = (window.innerHeight - height) / 2;
            if (y < top || top + height < y) {
                return false;
            }
            return true;
        }
        return false;
    }

    _getImageURL(slideElement, currentIndex) {
        const imageElement = slideElement.find('.item').eq(currentIndex).find('img');
        return imageElement.attr('data-src') || imageElement.attr('src');
    }

    _deferLoadImage(slideElement, currentIndex) {
        const items = slideElement.find('.item');
        items.each((index, element) => {
            const imageElement = $(element).find('img');

            const src = imageElement.attr('data-src') || imageElement.attr('src');
            if (!src) return;

            var targetAttr, sourceAttr;
            if (currentIndex - 1 <= index && index <= currentIndex + 1) {
                targetAttr = 'src';
                sourceAttr = 'data-src';
            } else {
                targetAttr = 'data-src';
                sourceAttr = 'src';
            }

            imageElement.attr(sourceAttr, '');
            imageElement.attr(targetAttr, src);

            if (targetAttr === 'src') {
                imageElement.parent().append('<div class="loading"></div>');
                imageElement.one('load', () => {
                    imageElement.parent().find('.loading').remove();
                }).each((_, e) => {
                    if (e.complete) {
                        $(e).trigger('load');
                    }
                });
            }
        });

        // [items.eq(currentIndex - 1), items.eq(currentIndex), items.eq(currentIndex + 1)]
        //     .map((element) => element.find('img'))
        //     .forEach((element) => {
        //         const src = element.attr('data-src');
        //         if (!src) return;

        //         element.attr('data-src', '');
        //         element.attr('src', src);

        //         element.parent().append('<div class="loading"></div>');
        //         element.one('load', () => {
        //             element.parent().find('.loading').remove();
        //         }).each((_, e) => {
        //             if (e.complete) {
        //                 $(e).trigger('load');
        //             }
        //         });
        //     });
    }
}