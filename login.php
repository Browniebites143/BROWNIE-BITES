<?php
// Include the database connection and session start
require_once 'common/config.php';

$error_message = '';

// Check if user is already logged in, redirect to homepage
if (isset($_SESSION['user_id'])) {
    header('Location: index.php');
    exit;
}

// --- Handle Login Form Submission ---
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['login'])) {
    $email_phone = $_POST['email_phone'] ?? '';
    $password = $_POST['password'] ?? '';

    if (empty($email_phone) || empty($password)) {
        $error_message = "Email/Phone and Password are required.";
    } else {
        // Use prepared statements to prevent SQL injection
        $stmt = $conn->prepare("SELECT user_id, name, password FROM users WHERE email = ? OR phone = ?");
        $stmt->bind_param("ss", $email_phone, $email_phone);
        $stmt->execute();
        $result = $stmt->get_result();

        if ($result && $result->num_rows === 1) {
            $user = $result->fetch_assoc();

            // Verify the hashed password
            if (password_verify($password, $user['password'])) {
                // Password is correct!
                // Set session variables
                $_SESSION['user_id'] = $user['user_id'];
                $_SESSION['user_name'] = $user['name'];

                // Redirect to the homepage
                header('Location: index.php');
                exit;
            } else {
                $error_message = "Invalid email/phone or password.";
            }
        } else {
            $error_message = "Invalid email/phone or password.";
        }
        if ($stmt) $stmt->close();
    }
}
if ($conn) $conn->close();
?>
<!DOCTYPE html>
<html lang="en" class="dark">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>Login - BrownieBites</title>
    <!-- Tailwind CSS CDN -->
    <script src="https://cdn.tailwindcss.com"></script>
    <!-- Font Awesome CDN -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
    <!-- Google Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Poppins:wght@300;400;500&display=swap" rel="stylesheet">

    <script>
        // Configure Tailwind theme
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
    </style>
</head>
<body class="bg-gray-900 text-white font-poppins">

    <!-- Static Background (No animations as requested for login) -->
    <div class="fixed inset-0 bg-cover bg-center bg-no-repeat" style="background-image: url('https://placehold.co/1920x1080/4B2E05/000000?text=Static+Brownie+Image'); opacity: 0.2;"></div>

    <div class="relative min-h-screen flex items-center justify-center p-4">

        <!-- Glassmorphism Login Card -->
        <div class="w-full max-w-md bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border border-white/20">

            <!-- Logo & Title -->
            <div class="text-center mb-8">
                <i class="fa-solid fa-cookie-bite fa-3x text-caramel mb-4"></i>
                <h1 class="text-4xl font-playfair text-white">Welcome Back</h1>
                <p class="text-gray-300 font-light mt-2">Log in to BrownieBites</p>
            </div>

            <!-- Login Form -->
            <form action="login.php" method="POST" class="space-y-6">

                <?php if ($error_message): ?>
                    <div class="bg-red-500/30 border border-red-500 text-red-100 px-4 py-3 rounded-lg text-center">
                        <?php echo e($error_message); ?>
                    </div>
                <?php endif; ?>

                <!-- Email / Phone Input -->
                <div>
                    <label for="email_phone" class="block text-sm font-medium text-gray-300 mb-2">Email or Phone</label>
                    <div class="relative">
                        <span class="absolute inset-y-0 left-0 flex items-center pl-3">
                            <i class="fa-solid fa-user text-gray-400"></i>
                        </span>
                        <input type="text" id="email_phone" name="email_phone" required
                               class="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-caramel">
                    </div>
                </div>

                <!-- Password Input -->
                <div>
                    <label for="password" class="block text-sm font-medium text-gray-300 mb-2">Password</label>
                    <div class="relative">
                        <span class="absolute inset-y-0 left-0 flex items-center pl-3">
                            <i class="fa-solid fa-lock text-gray-400"></i>
                        </span>
                        <input type="password" id="password" name="password" required
                               class="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-caramel">
                    </div>
                </div>

                <!-- Remember Me & Forgot Password -->
                <div class="flex items-center justify-between text-sm">
                    <label class="flex items-center text-gray-300">
                        <input type="checkbox" name="remember" class="w-4 h-4 rounded bg-white/20 border-white/30 text-caramel focus:ring-caramel">
                        <span class="ml-2">Remember Me</span>
                    </label>
                    <a href="#" class="font-medium text-caramel hover:text-gold transition-colors">Forgot Password?</a>
                </div>

                <!-- Login Button -->
                <button type="submit" name="login"
                        class="w-full py-3 px-4 bg-gradient-to-r from-brown-dark to-caramel text-white font-bold rounded-lg shadow-lg
                               hover:from-caramel hover:to-gold transition-all duration-300 ease-in-out
                               focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-gold">
                    Sign In
                </button>
            </form>

            <!-- Sign Up Link -->
            <p class="text-center text-sm text-gray-300 mt-8">
                Not a member? 
                <a href="#" class="font-medium text-caramel hover:text-gold transition-colors">Join the Brownie Family!</a>
            </p>
        </div>
    </div>

    <!-- Global JS -->
    <script src="assets/js/main.js"></script>
</body>
</html>
