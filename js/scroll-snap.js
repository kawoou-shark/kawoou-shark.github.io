class ScrollSnap {
    constructor(options) {
        this._options = options || {};
        this._containers = [];
        this._onSnap = [];
        this._scrollDirection = 'NONE';
        this._scrollFinishHandlingTimer = null;
        this._skipScrollFinishY = -1;

        this._touching = false;
        this._prevY = null;

        $(document).on('touchstart', () => {
            this._touching = true;
        });
        $(document).on('touchend', () => {
            this._touching = false;
            this._fireScrollEvent(true);
        });

        $(document).scroll(() => {
            this._fireScrollEvent(true);
        });

        $(window).resize(() => {
            this._fireScrollEvent(false);
        });
    }

    onSnap(callback) {
        this._onSnap.push(callback);
    }

    addContainer(element) {
        this._containers.push(element);
    }

    _fireScrollEvent(isScrolling) {
        const y = $(document).scrollTop();
        if (isScrolling) {
            this._scrollEvent(y, this._prevY);
        } else {
            this._scrollEvent(y, y);
        }
        this._prevY = y;
    }

    _scrollEvent(y, prevY) {
        if (this._containers.length === 0) return;

        if (this._scrollFinishHandlingTimer !== null) {
            clearTimeout(this._scrollFinishHandlingTimer);
        }

        const deltaY = y - prevY;
        if (deltaY > 0) {
            this._scrollDirection = 'BOTTOM';
        } else if (deltaY < 0) {
            this._scrollDirection = 'TOP';
        }

        this._scrollFinishHandlingTimer = setTimeout(() => {
            if (this._touching) return;
            this._scrollFinished(y);
            this._scrollFinishHandlingTimer = null;
        }, this._options['delay'] || 250);
    }

    _scrollFinished(y) {
        if (this._skipScrollFinishY === y) {
            this._skipScrollFinishY = -1;
            return;
        }
        const duration = this._options['duration'] || 400;
        const halfHeight = Math.floor(window.innerHeight / 2);

        const middleY = (() => {
            switch (this._scrollDirection) {
                case 'TOP':
                    return y + halfHeight * 0.5;
                case 'BOTTOM':
                    return y + halfHeight * 1.5;
                default:
                    return y + halfHeight;
            }
        })();


        const targetContainer = this._containers
            .map((element) => {
                const top = $(element).position().top;
                const height = $(element).outerHeight();
                const range = {
                    start: top,
                    end: top + height
                };
                const startOffset = range.start - middleY;
                const endOffset = range.end - middleY;
                return {
                    element,
                    range,
                    startOffset,
                    endOffset,
                    height,
                    absOffset: Math.min(Math.abs(startOffset), Math.abs(endOffset))
                };
            })
            .find((obj) => {
                if (obj.range.start <= middleY && middleY <= obj.range.end) {
                    return true;
                } else {
                    return false;
                }
            });

        if (!targetContainer) return;
        if (targetContainer.absOffset >= halfHeight) return;

        if (Math.abs(targetContainer.startOffset) < Math.abs(targetContainer.endOffset)) {
            this._skipScrollFinishY = targetContainer.range.start;
            $('html, body').animate( {
                scrollTop: this._skipScrollFinishY.toString() + 'px'
            }, {
                duration,
                easing: 'easeInOutQuint'
            });
        } else {
            this._skipScrollFinishY = targetContainer.range.end - window.innerHeight;
            $('html, body').animate( {
                scrollTop: this._skipScrollFinishY.toString() + 'px'
            }, {
                duration,
                easing: 'easeInOutQuint'
            });
        }
        this._scrollDirection = '';

        this._onSnap.forEach((callback) => {
            callback(targetContainer.element);
        });
    }
}