import React from 'react';
import Footer from '../Page/Footer';
import '../style/Home.css';
import ImageCarousel from '../Page/ImageCarousel';

function Home() {
    return (
        <div className="page">
            <main>
                <h2>Bienvenue sur MedConnect</h2>
                <div className="carousel-container">
                    <ImageCarousel />
                    <button onClick={() => { window.location.href = '/login'; }} className="button">
                        Se connecter
                    </button>
                </div>
            </main>

            <footer>
                <Footer />
            </footer>
        </div>
    );
}

export default Home;
