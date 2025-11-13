(async () => {
    class CoverFlow {
        constructor(container, covers = [], size = 256, clickHandler = null) {
            this.container      = container;
            this.wrapper        = document.createElement('div');
            this.innerContainer = document.createElement('div');

            this.coverSize    = size;
            this.currentIndex = 0;
            this.length       = covers.length;

            this.wrapper.className        = 'coverFlow';
            this.wrapper.style.height     = `${size}px`;
            this.innerContainer.className = 'container';

            this.eventListeners = [];

            covers.forEach((htmlString, index) => {
                const temp = document.createElement('div');

                temp.innerHTML = htmlString.trim();

                const element = temp.firstChild;

                if(!element) return;

                element.classList.add('cover');

                const clickListener = () => { clickHandler ? clickHandler(index) : this.update(index); };

                element.addEventListener('click', clickListener);

                this.eventListeners.push({
                    element: element,
                    event: 'click',
                    listener: clickListener
                });

                this.innerContainer.appendChild(element);
            });

            this.wrapper  .appendChild(this.innerContainer);
            this.container.appendChild(this.wrapper);
        }

        destroy() {
            this.eventListeners.forEach(({ element, event, listener }) => {
                if(element && element.removeEventListener) element.removeEventListener(event, listener);
            });

            this.eventListeners = [];

            if(this.wrapper && this.wrapper.parentNode) this.wrapper.parentNode.removeChild(this.wrapper);

            this.container      = null;
            this.wrapper        = null;
            this.innerContainer = null;
        }

        update(index = this.currentIndex) {
            this.currentIndex = index;

            const covers = Array.from(this.innerContainer.querySelectorAll(".cover"));

            const MARGIN_X = this.coverSize * 0.5;

            covers.forEach((cover, index) => {
                let s  = index === this.currentIndex ? 1 : 0.95;
                let tX = MARGIN_X * (index - this.currentIndex) + (index < this.currentIndex ? -this.coverSize * 0.4 : index > this.currentIndex ? this.coverSize * 0.4 : 0);
                let tZ = index === this.currentIndex ? 0 : this.coverSize;
                let tR = index < this.currentIndex ? 55 : index > this.currentIndex ? -55 : 0;

                gsap.to(cover, {
                    duration: 1,
                    x: tX,
                    z: -tZ * 1.8,
                    rotateY: tR,
                    scale: s,
                    ease: 'expo.out',
                    filter: `brightness(${s == 1 ? 1 : 0.9})`
                });
            });
        }
    }

    const colors = [ '#e11d48', '#f472b6', '#fb923c', '#facc15', '#84cc16', '#10b981', '#0ea5e9', '#3b82f6', '#8b5cf6', '#a78bfa' ];

    const coverFlow = new CoverFlow(document.querySelector('body main .container'), Array.from({ length: 50 }, (_, i) => `<div style="background-color: ${colors[i % colors.length]}; aspect-ratio: 1 / 1;"></div>`));

    coverFlow.update(coverFlow.length / 2);
})();