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
    $stmtUser = $pdo->prepare("SELECT TIMESTAMPDIFF(SECOND, last_trivia_at, NOW()) FROM users WHERE id = ?");
    $stmtUser->execute([$userId]);
    $diff = $stmtUser->fetchColumn();

    $stmtCooldown = $pdo->query("SELECT `value` FROM settings WHERE `key` = 'trivia_cooldown'");
    $cooldownHours = (int)($stmtCooldown->fetchColumn() ?: 6);
    $cooldown = $cooldownHours * 3600;

    if ($diff !== null && $diff < $cooldown) {
        $remaining = $cooldown - $diff;
        $hours = floor($remaining / 3600);
        $mins = floor(($remaining % 3600) / 60);
        jsonResponse(false, "Debes esperar $hours h $mins m.", ['cooldown' => true]);
    }

    // 2. Seleccionar preguntas candidatas (tomamos más por seguridad)
    $stmtTrivias = $pdo->query("SELECT id, question, option_a, option_b, option_c, category, correct_option FROM trivias WHERE is_active = 1 ORDER BY RAND() LIMIT 6");
    $candidates = $stmtTrivias->fetchAll();

    // Asegurar unicidad total por ID
    $questions = [];
    $usedIds = [];
    foreach($candidates as $q) {
        if(!in_array($q['id'], $usedIds)) {
            $questions[] = $q;
            $usedIds[] = $q['id'];
        }
        if(count($questions) === 3) break;
    }

    if (count($questions) < 3) {
        jsonResponse(false, "No hay suficientes preguntas disponibles.");
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
    $isCorrect = (strtolower($userAnswer) === strtolower($correctKey));

    if (!$isCorrect) {
        unset($_SESSION['trivia_session']);
        // Marcar cooldown incluso si falla (para evitar spam)
        $stmtUpdate = $pdo->prepare("UPDATE users SET last_trivia_at = NOW() WHERE id = ?");
        $stmtUpdate->execute([$userId]);
        
        // Obtener el texto de la respuesta correcta para mejor feedback
        $q = $session['questions'][$idx];
        $correctText = $q['option_' . strtolower($correctKey)] ?? 'Desconocida';
        
        jsonResponse(true, "Incorrecto. La respuesta era: $correctText", ['correct' => false, 'finished' => true, 'correct_key' => $correctKey]);
    }

    $session['current_idx']++;
    
    if ($session['current_idx'] >= 3) {
        // GANÓ
        $pdo->beginTransaction();
        try {
            // --- CÁLCULO DE RECOMPENSA VARIABLE (1 a 5 sobres) ---
            $stmtRates = $pdo->prepare("SELECT `value` FROM settings WHERE `key` = 'promo_reward_rates'");
            $stmtRates->execute();
            $ratesJson = $stmtRates->fetchColumn();
            $rates = $ratesJson ? json_decode($ratesJson, true) : ["1"=>20,"2"=>20,"3"=>20,"4"=>20,"5"=>20];

            $rand = mt_rand(1, 100);
            $acc = 0;
            $packsGained = 1; // Default
            foreach ($rates as $amount => $percentage) {
                $acc += $percentage;
                if ($rand <= $acc) {
                    $packsGained = intval($amount);
                    break;
                }
            }

            $stmtUpdate = $pdo->prepare("UPDATE users SET last_trivia_at = NOW(), packs_available = packs_available + ? WHERE id = ?");
            $stmtUpdate->execute([$packsGained, $userId]);

            $stmtAudit = $pdo->prepare("INSERT INTO audit_packs (user_id, source_type, source_id, amount) VALUES (?, 'trivia', 'Misión Cumplida', ?)");
            $stmtAudit->execute([$userId, $packsGained]);

            $pdo->commit();
            unset($_SESSION['trivia_session']);
            
            $msg = ($packsGained > 1) ? "¡Increíble! Ganaste $packsGained sobres." : "¡Misión cumplida! Ganaste 1 sobre.";
            jsonResponse(true, $msg, ['correct' => true, 'finished' => true, 'won' => true, 'amount' => $packsGained]);
        } catch (Exception $e) {
            if ($pdo->inTransaction()) $pdo->rollBack();
            jsonResponse(false, "Error al procesar premio");
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
