import { useState } from "react";

export function useCarousel(items) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const total = items.length;

    const getPosition = (index) => {
        let position = index - currentIndex;

        if (position > total / 2) position -= total;
        if (position < -total / 2) position += total;

        return position;
    };

    const next = () => {
        setCurrentIndex((i) => (i + 1) % total);
    };

    const prev = () => {
        setCurrentIndex((i) => (i - 1 + total) % total);
    };

    return {
        currentIndex,
        getPosition,
        next,
        prev
    };
}
