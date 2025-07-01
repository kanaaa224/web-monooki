class CoverFlow {
    constructor(container, covers = [], size = 256) {
        const wrapper = document.createElement('div');

        wrapper.className = 'coverFlow';

        wrapper.style.height = `${size}px`;

        const innerContainer = document.createElement('div');

        innerContainer.className = 'container';

        covers.forEach(htmlString => {
            const temp = document.createElement('div');

            temp.innerHTML = htmlString.trim();

            const element = temp.firstChild;

            if(element) {
                element.classList.add('cover');

                innerContainer.appendChild(element);
            }
        });

        wrapper.appendChild(innerContainer);
        container.appendChild(wrapper);

        this.container      = container;
        this.wrapper        = wrapper;
        this.innerContainer = innerContainer;

        this.coverSize    = size;
        this.currentIndex = 0;
        this.length       = covers.length;
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

const coverFlow = new CoverFlow(document.querySelector('body'), Array.from({ length: 40 }, (_, i) => `<div onclick="coverFlow.update(${i})" style="background-color: ${'#'+(~~(Math.random()*0xFFFFFF)).toString(16).padStart(6,'0')}; aspect-ratio: 1 / 1;"></div>`));

coverFlow.update(coverFlow.length / 2);