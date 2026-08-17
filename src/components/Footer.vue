<script setup lang="ts">
import { ref } from 'vue'

const email = ref('')

const handleSubscribe = () => {
    if (email.value) {
        alert('Thank you for subscribing!')
        email.value = ''
    }
}
</script>

<template>
    <footer class="footer">
        <div class="footer-container">
            <div class="footer-grid">
                <!-- Column 1: Services -->
                <div class="footer-col">
                    <h3 class="col-title">Services</h3>
                    <ul class="footer-links">
                        <li><a href="#">AC Service</a></li>
                        <li><a href="#">Carpenter Services</a></li>
                        <li><a href="#">Electrician Services</a></li>
                        <li><a href="#">Geyser Services</a></li>
                        <li><a href="#">Home Appliances Repair</a></li>
                        <li><a href="#">Handyman Services</a></li>
                        <li><a href="#">Painter Services</a></li>
                        <li><a href="#">Pest Control Services</a></li>
                        <li><a href="#">Plumber Services</a></li>
                    </ul>
                </div>

                <!-- Column 2: Available in -->
                <div class="footer-col">
                    <h3 class="col-title">Available in</h3>
                    <ul class="footer-links">
                        <li><a href="#">Lahore</a></li>
                        <li><a href="#">Karachi</a></li>
                        <li><a href="#">Islamabad</a></li>
                        <li><a href="#">Rawalpindi</a></li>
                        <li><a href="#">Sialkot</a></li>
                    </ul>
                </div>

                <!-- Column 3: Main Menu -->
                <div class="footer-col">
                    <h3 class="col-title">Main Menu</h3>
                    <ul class="footer-links">
                        <li><router-link to="/">Home</router-link></li>
                        <li><router-link to="/about">About Us</router-link></li>
                        <li><router-link to="/contact">Contact Us</router-link></li>
                        <li><a href="#">Privacy</a></li>
                        <li><a href="#">FAQs</a></li>
                        <li><a href="#">Terms & Conditions</a></li>
                        <li><a href="#">Cancellation Policy</a></li>
                        <li><a href="#">Blogs</a></li>
                    </ul>
                </div>

                <!-- Column 4: Connect with us -->
                <div class="footer-col">
                    <h3 class="col-title">Connect with us</h3>
                    <ul class="footer-links social-list">
                        <li><a href="tel:042111111242" class="phone-link">📞 042 111 111 242</a></li>
                        <li><a href="#">🐦 Twitter</a></li>
                        <li><a href="#">💼 LinkedIn</a></li>
                        <li><a href="#">📘 Facebook</a></li>
                        <li><a href="#">▶️ Youtube</a></li>
                        <li><a href="#">📷 Instagram</a></li>
                        <li><a href="#">🎵 TikTok</a></li>
                    </ul>
                </div>

                <!-- Column 5: Newsletter & Mobile Apps -->
                <div class="footer-col">
                    <h3 class="col-title">Newsletter</h3>
                    <p class="newsletter-sub">Subscribe to our newsletter.</p>
                    <form @submit.prevent="handleSubscribe" class="newsletter-form">
                        <input 
                            v-model="email" 
                            type="email" 
                            placeholder="Enter your email" 
                            class="newsletter-input" 
                            required 
                        />
                        <button type="submit" class="newsletter-btn" aria-label="Subscribe">➔</button>
                    </form>

                    <div class="app-badges">
                        <a href="#" class="app-badge">
                            <span class="badge-icon">🍎</span>
                            <div class="badge-text">
                                <span class="sub">Available on the</span>
                                <span class="main">App Store</span>
                            </div>
                        </a>
                        <a href="#" class="app-badge">
                            <span class="badge-icon">▶</span>
                            <div class="badge-text">
                                <span class="sub">GET IT ON</span>
                                <span class="main">Google Play</span>
                            </div>
                        </a>
                    </div>
                </div>
            </div>

            <!-- Bottom Copyright Bar -->
            <div class="footer-bottom">
                <p class="copyright">Copyright © 2026 Mr Home Services, All Rights Reserved.</p>
                <div class="footer-logo">Mr Home Services</div>
            </div>
        </div>
    </footer>
</template>

<style scoped>
.footer {
    background: #1D4ED8;
    color: #ffffff;
    padding: 60px 0 20px;
    font-size: 14px;
}

.footer-container {
    max-width: 1280px;
    margin: 0 auto;
    padding: 0 24px;
}

.footer-grid {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 32px;
    padding-bottom: 48px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.15);
}

.col-title {
    font-size: 16px;
    font-weight: 700;
    margin-bottom: 20px;
    color: #ffffff;
}

.footer-links {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.footer-links a {
    color: #DBEAFE;
    text-decoration: none;
    transition: color 0.2s;
    font-size: 13px;
}

.footer-links a:hover {
    color: #ffffff;
    text-decoration: underline;
}

.phone-link {
    font-weight: 700;
    color: #ffffff !important;
}

.newsletter-sub {
    color: #DBEAFE;
    font-size: 13px;
    margin-bottom: 12px;
}

.newsletter-form {
    display: flex;
    background: #ffffff;
    border-radius: 20px;
    padding: 2px;
    margin-bottom: 24px;
    overflow: hidden;
}

.newsletter-input {
    border: none;
    outline: none;
    padding: 10px 14px;
    font-size: 13px;
    flex: 1;
    color: #1E293B;
}

.newsletter-btn {
    background: #1D4ED8;
    color: white;
    border: none;
    padding: 0 16px;
    border-radius: 18px;
    cursor: pointer;
    font-size: 14px;
}

.app-badges {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.app-badge {
    background: #1E40AF;
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 8px;
    padding: 8px 14px;
    display: flex;
    align-items: center;
    gap: 10px;
    color: white;
    text-decoration: none;
    transition: background 0.2s;
}

.app-badge:hover {
    background: #1D4ED8;
}

.badge-icon {
    font-size: 20px;
}

.badge-text {
    display: flex;
    flex-direction: column;
}

.badge-text .sub {
    font-size: 9px;
    text-transform: uppercase;
    color: #93C5FD;
}

.badge-text .main {
    font-size: 13px;
    font-weight: 700;
}

/* Footer Bottom */
.footer-bottom {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-top: 24px;
}

.copyright {
    color: #DBEAFE;
    font-size: 13px;
}

.footer-logo {
    font-size: 26px;
    font-weight: 800;
    color: #ffffff;
}

@media (max-width: 1024px) {
    .footer-grid {
        grid-template-columns: repeat(3, 1fr);
    }
}

@media (max-width: 640px) {
    .footer-grid {
        grid-template-columns: repeat(1, 1fr);
    }
    
    .footer-bottom {
        flex-direction: column;
        gap: 12px;
        text-align: center;
    }
}
</style>