import { useState } from "react";
import "../style/ImageCarousel.css";
import { useCarousel } from "../hooks/useCarousel";

const images = [
    "../../Public/Medecine.png",
    "../../Public/Medecine1.jpg",
    "../../Public/Medecine2.png",
    "../../Public/Medecine3.png",
    "../../Public/Medecine4.jpg",
    "../../Public/Medecine5.jpg",
    "../../Public/Medecine6.png",
    "../../Public/Medecine7.png",
    "../../Public/Medecine8.png",
    "../../Public/Medecine9.png",
    "../../Public/Medecine10.png"
];

export default function ImageCarousel() {
    const carousel = useCarousel(images);

    return (
        <div className="scene">
            <div className="carousel">
                {images.map((img, index) => (
                    <div
                        key={index}
                        className="carousel-item"
                        data-position={carousel.getPosition(index)}
                        style={{ backgroundImage: `url(${img})` }}
                    />
                ))}
            </div>

            <div className="controls">
                <button onClick={carousel.prev}>◀</button>
                <button onClick={carousel.next}>▶</button>
            </div>
        </div>
    );
}