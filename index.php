<?php
// Include config
require_once 'common/config.php';

// --- Authentication Check ---
// If user is not logged in, redirect to login page
if (!isset($_SESSION['user_id'])) {
    header('Location: login.php');
    exit;
}

// Get user's name from session
$user_name = $_SESSION['user_name'];
?>
<!DOCTYPE html>
<html lang="en" class="dark">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>Home - BrownieBites</title>
    <!-- Tailwind CSS CDN -->
    <script src="https://cdn.tailwindcss.com"></script>
    <!-- Font Awesome CDN -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
    <!-- Google Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Poppins:wght@300;400;500&display=swap" rel="stylesheet">

    <script>
        // Configure Tailwind theme (same as login)
        tailwind.config = {
            darkMode: 'class',
            theme: {
                extend: {
                    colors: {
                        'brown-dark': '#4B2E05',
                        'brown-light': '#7a4a0b',
                        'caramel': '#c68a4e',
                        'gold': '#FFD700',
                    },
                    fontFamily: {
                        'playfair': ['"Playfair Display"', 'serif'],
                        'poppins': ['Poppins', 'sans-serif'],
                    },
                    keyframes: {
                        // Cocoa dust animation
                        cocoaDust: {
                            '0%, 100%': { opacity: '0', transform: 'translateY(0px) scale(0.5)' },
                            '50%': { opacity: '0.3', transform: 'translateY(-100px) scale(1)' },
                        }
                    },
                    animation: {
                        'cocoa-dust': 'cocoaDust 8s ease-in-out infinite',
                    }
                }
            }
        }
    </script>
    <style>
        /* Disable text selection */
        body {
            user-select: none;
            -webkit-user-select: none;
            -moz-user-select: none;
            -ms-user-select: none;
        }
        /* Custom animation delays for cocoa dust */
        .dot-1 { animation-delay: 0s; }
        .dot-2 { animation-delay: 2s; }
        .dot-3 { animation-delay: 4s; }
        .dot-4 { animation-delay: 6s; }
    </style>
</head>
<body class="bg-gray-900 text-white font-poppins overflow-x-hidden">

    <!-- Cocoa Dust Animated Background -->
    <div class="absolute inset-0 z-0 overflow-hidden">
        <div class="absolute left-[10%] top-[20%] w-2 h-2 bg-caramel/30 rounded-full animate-cocoa-dust dot-1"></div>
        <div class="absolute left-[80%] top-[30%] w-3 h-3 bg-caramel/30 rounded-full animate-cocoa-dust dot-2"></div>
        <div class="absolute left-[30%] top-[70%] w-2 h-2 bg-caramel/30 rounded-full animate-cocoa-dust dot-3"></div>
        <div class="absolute left-[60%] top-[80%] w-1 h-1 bg-caramel/30 rounded-full animate-cocoa-dust dot-4"></div>
    </div>

    <!-- Page Wrapper -->
    <div class="relative z-10 min-h-screen flex flex-col">

        <!-- Header -->
        <?php require_once 'common/header.php'; ?>

        <!-- Hero Section -->
        <main class="flex-grow flex items-center justify-center text-center -mt-16">
            <div class="relative w-full h-screen flex items-center justify-center">
                <!-- Background Image -->
                <div class="absolute inset-0 bg-cover bg-center" 
                     style="background-image: url('https://placehold.co/1920x1080/4B2E05/000000?text=Steaming+Brownie+Hero');">
                </div>
                <!-- Dark Overlay -->
                <div class="absolute inset-0 bg-black/60"></div>

                <!-- Hero Content -->
                <div class="relative z-20 p-4 animate-fadeIn">
                    <h1 class="text-5xl md:text-7xl font-playfair font-bold text-white shadow-lg mb-4">
                        Bite into Happiness
                    </h1>
                    <p class="text-lg md:text-2xl text-gray-200 font-light mb-8 shadow-md">
                        One Brownie at a Time.
                    </p>

                    <!-- Call to Action Buttons -->
                    <div class="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <a href="menu.php" 
                           class="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-brown-dark to-caramel text-white font-bold rounded-lg shadow-lg
                                  hover:from-caramel hover:to-gold transition-all duration-300 ease-in-out transform hover:scale-105">
                            Order Now
                        </a>
                        <a href="specials.php" 
                           class="w-full sm:w-auto px-8 py-3 bg-transparent border-2 border-gold text-gold font-bold rounded-lg shadow-lg
                                  hover:bg-gold hover:text-brown-dark transition-all duration-300 ease-in-out transform hover:scale-105">
                            Today's Specials
                        </a>
                    </div>
                </div>
            </div>
        </main>

        <!-- Bottom Navigation (Mobile) -->
        <?php require_once 'common/bottom.php'; ?>

        <!-- Add padding at the bottom to avoid overlap with bottom nav -->
        <div class="h-16 md:hidden"></div>
    </div>

    <!-- Global JS -->
    <script src="assets/js/main.js"></script>
</body>
</html>
