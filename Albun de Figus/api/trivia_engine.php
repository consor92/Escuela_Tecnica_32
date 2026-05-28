<?php
require_once '../includes/db.php';
require_once '../includes/functions.php';

if (!isLoggedIn()) {
    jsonResponse(false, "No has iniciado sesión.");
}

$userId = $_SESSION['user_id'];
$action = $_GET['action'] ?? '';

/**
 * ACCIÓN: INICIAR SESIÓN
 */
if ($action === 'start') {
    // 1. Verificar Cooldown (6 horas)
    $stmtUser = $pdo->prepare("SELECT last_trivia_at FROM users WHERE id = ?");
    $stmtUser->execute([$userId]);
    $lastTrivia = $stmtUser->fetchColumn();

    if ($lastTrivia) {
        $lastTime = strtotime($lastTrivia);
        $diff = time() - $lastTime;
        $cooldown = 6 * 3600;

        if ($diff < $cooldown) {
            $remaining = $cooldown - $diff;
            $hours = floor($remaining / 3600);
            $mins = floor(($remaining % 3600) / 60);
            jsonResponse(false, "Debes esperar $hours h $mins m.", ['cooldown' => true]);
        }
    }

    // 2. Seleccionar 3 preguntas al azar
    $stmtTrivias = $pdo->query("SELECT id, question, option_a, option_b, option_c, category, correct_option FROM trivias WHERE is_active = 1 ORDER BY RAND() LIMIT 3");
    $questions = $stmtTrivias->fetchAll();

    if (count($questions) < 3) {
        jsonResponse(false, "No hay suficientes preguntas.");
    }

    // 3. Mezclar opciones para cada pregunta
    foreach($questions as &$q) {
        $opts = [
            ['key' => 'a', 'val' => $q['option_a']],
            ['key' => 'b', 'val' => $q['option_b']],
            ['key' => 'c', 'val' => $q['option_c']]
        ];
        shuffle($opts);
        $q['shuffled_options'] = $opts;
    }

    $_SESSION['trivia_session'] = [
        'questions' => $questions,
        'current_idx' => 0,
        'correct_count' => 0,
        'question_start_time' => time()
    ];

    $q = $questions[0];
    jsonResponse(true, "Inicio", [
        'question' => [
            'id' => $q['id'],
            'category' => $q['category'],
            'question' => $q['question'],
            'options' => $q['shuffled_options']
        ],
        'total' => 3,
        'current' => 1
    ]);
}

/**
 * ACCIÓN: ENVIAR RESPUESTA
 */
if ($action === 'submit') {
    if (!isset($_SESSION['trivia_session'])) jsonResponse(false, "No hay sesión activa.");

    $session = &$_SESSION['trivia_session'];
    $idx = $session['current_idx'];
    $userAnswer = $_POST['answer'] ?? '';

    // Validar Tiempo (32s)
    if ((time() - $session['question_start_time']) > 32) {
        unset($_SESSION['trivia_session']);
        jsonResponse(false, "¡Tiempo agotado!", ['finished' => true]);
    }

    $correctKey = $session['questions'][$idx]['correct_option'];
    $isCorrect = ($userAnswer === $correctKey);

    if (!$isCorrect) {
        unset($_SESSION['trivia_session']);
        // Marcar cooldown incluso si falla (para evitar spam)
        $stmtUpdate = $pdo->prepare("UPDATE users SET last_trivia_at = NOW() WHERE id = ?");
        $stmtUpdate->execute([$userId]);
        jsonResponse(true, "Incorrecto", ['correct' => false, 'finished' => true, 'correct_key' => $correctKey]);
    }

    $session['current_idx']++;
    
    if ($session['current_idx'] >= 3) {
        // GANÓ
        $pdo->beginTransaction();
        try {
            $stmtUpdate = $pdo->prepare("UPDATE users SET last_trivia_at = NOW(), packs_available = packs_available + 1 WHERE id = ?");
            $stmtUpdate->execute([$userId]);

            $stmtAudit = $pdo->prepare("INSERT INTO audit_packs (user_id, source_type, source_id, amount) VALUES (?, 'trivia', 'Misión Cumplida', 1)");
            $stmtAudit->execute([$userId]);

            $pdo->commit();
            unset($_SESSION['trivia_session']);
            jsonResponse(true, "¡Ganaste!", ['correct' => true, 'finished' => true, 'won' => true]);
        } catch (Exception $e) {
            $pdo->rollBack();
            jsonResponse(false, "Error");
        }
    } else {
        $session['question_start_time'] = time();
        $q = $session['questions'][$session['current_idx']];
        jsonResponse(true, "Siguiente", [
            'correct' => true,
            'finished' => false,
            'question' => [
                'id' => $q['id'],
                'category' => $q['category'],
                'question' => $q['question'],
                'options' => $q['shuffled_options']
            ],
            'current' => $session['current_idx'] + 1
        ]);
    }
}

jsonResponse(false, "Acción no válida.");
