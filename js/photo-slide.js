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

        this._bindDrag(containerElement, slideElement);
        this._bindHide(containerElement, slideElement);
        this._bindButtons(containerElement, slideElement);
        this._bindKeyboard(containerElement, slideElement);
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
        var isTouching = false;
        var startX = -1;
        var lastX = -1;
        var moveDirection = 'NONE';
        slideElement.bind('touchstart', (event) => {
            const x = event.touches[0].clientX;
            const y = event.touches[0].clientY;
            if (this._containsImgElement(event.target, x, y)) {
                containerElement.addClass('dragging');

                isTouching = true;
                startX = x;
                lastX = x;
                moveDirection = 'NONE';
            }
        });
        slideElement.bind('touchmove', (event) => {
            if (!isTouching) return;

            const x = event.touches[0].clientX;
            if (Math.abs(x - lastX) > 4) {
                if (x > lastX) {
                    moveDirection = 'LEFT';
                } else {
                    moveDirection = 'RIGHT';
                }
            }
            lastX = x;

            if (moveDirection === 'NONE') {
                return;
            }

            const delta = x - startX;
            const currentIndex = parseInt(slideElement.attr('data-index'))
            slideElement.find('.item').eq(0).removeClass('transition').css({
                'margin-left': 'calc(' + (-currentIndex * 100).toString() + '% + ' + delta.toString() + 'px)'
            });
        });
        slideElement.bind('touchend', (event) => {
            if (!isTouching) return;
            isTouching = false;

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
        [items.eq(currentIndex - 1), items.eq(currentIndex), items.eq(currentIndex + 1)]
            .map((element) => element.find('img'))
            .forEach((element) => {
                const src = element.attr('data-src');
                if (!src) return;

                element.attr('data-src', '');
                element.attr('src', src);

                element.parent().append('<div class="loading"></div>');
                element.one('load', () => {
                    element.parent().find('.loading').remove();
                }).each((_, e) => {
                    if (e.complete) {
                        $(e).trigger('load');
                    }
                });
            });
    }
}