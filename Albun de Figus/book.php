<!-- ÁREA DEL LIBRO -->
<div class="album-container">
    <div id="album-book">
        <?php foreach ($pages as $pIdx => $pData): ?>
            
            <!-- PORTADAS -->
            <?php if ($pData['type'] === 'cover' || $pData['type'] === 'back-cover'): 
                $coverImgRaw = ($pData['type'] === 'cover') ? $albumConfig['cover_img'] : $albumConfig['back_cover_img'];
                $coverImgThumb = getDriveUrl($pdo, $coverImgRaw, 800);
                $isFirst = $pData['type'] === 'cover';
            ?>
                <div class="page" data-density="hard">
                    <img src="<?php echo $coverImgThumb; ?>" 
                         class="absolute inset-0 w-full h-full object-cover z-0" 
                         width="450" height="600"
                         loading="<?php echo $isFirst ? 'eager' : 'lazy'; ?>" 
                         decoding="<?php echo $isFirst ? 'sync' : 'async'; ?>"
                         <?php echo $isFirst ? 'fetchpriority="high"' : ''; ?>>
                    <div class="page-content-wrapper relative z-10">
                        <div class="drag-hint">Arrastre</div>
                        <?php if($pData['type'] === 'back-cover'): ?>
                            <div class="page-number text-white/30">FIN DEL ÁLBUM</div>
                        <?php endif; ?>
                    </div>
                </div>

            <!-- 2. PÁGINAS DE HONOR (#1 Y #50) -->
            <?php elseif ($pData['type'] === 'honor'): 
                $st = $pData['stickers'][0];
                $stuck = isset($userInv[$st['id']]) && $userInv[$st['id']]['is_stuck'] == 1;
                $imgUrlFull = getDriveUrl($pdo, $st['external_url']);
                $imgUrlThumb = getDriveUrl($pdo, $st['external_url'], 400);
                $stData = htmlspecialchars(json_encode($st));
                $rarity = $st['rarity'];

                // Imagen de fondo de honor dinámica
                $honorBgRaw = ($pData['title'] === 'SALÓN DE HONOR') ? $albumConfig['honor_page_1_bg'] : $albumConfig['honor_page_2_bg'];
                $honorBgThumb = getDriveUrl($pdo, $honorBgRaw, 800);
                $isFirstHonor = ($pData['title'] === 'SALÓN DE HONOR');
            ?>
                <div class="page" data-density="hard">
                    <img src="<?php echo $honorBgThumb; ?>" 
                         class="absolute inset-0 w-full h-full object-fill z-0" 
                         width="450" height="600"
                         loading="<?php echo $isFirstHonor ? 'eager' : 'lazy'; ?>"
                         decoding="async">
                    <div class="page-content-wrapper !p-0 relative z-10 h-full w-full">
                        <div class="drag-hint">Arrastre</div>
                        
                        <!-- Centrado absoluto perfecto -->
                        <div class="absolute inset-0 flex items-center justify-center">
                            <div class="slot !w-[124px] !h-[169px] slot-rarity-gold shadow-2xl bg-white/5 border-white/10" data-number="<?php echo $st['number']; ?>">
                                <?php if($stuck): ?>
                                    <div class="sticker-body frame-gold" data-rotation="0" style="--rotation: 0deg" onclick='handleCardClick(event, <?php echo $stData; ?>, "<?php echo $imgUrlFull; ?>")'>    
                                        <div class="sticker-content">
                                            <div class="gold-aura"></div>
                                            <div class="overlay-gold"></div>
                                            <div class="gold-sweep"></div>
                                            <img src="<?php echo $imgUrlThumb; ?>" 
                                                 class="sticker-stuck gold-filter" 
                                                 width="124" height="169"
                                                 loading="<?php echo $isFirstHonor ? 'eager' : 'lazy'; ?>" 
                                                 decoding="async">
                                        </div>
                                    </div>
                                <?php else: ?>
                                    <span class="text-white/20 text-3xl"><?php echo $st['number']; ?></span>
                                <?php endif; ?>
                            </div>
                        </div>
                        
                        <!-- Numeración sin afectar el centrado -->
                        <div class="absolute bottom-4 left-0 right-0 text-center">
                            <div class="page-number text-white/30">PÁGINA <?php echo $pIdx; ?></div>
                        </div>
                    </div>
                </div>

            <!-- PÁGINAS REGULARES (4 SLOTS) -->
            <?php else: 
                $totalP = count($pages);
                $bgId = "";
                
                // Lógica de fondos basada en el número visible ($pIdx) y la config del álbum
                if ($pIdx == 2 || $pIdx == $totalP - 3) {
                    $bgId = $albumConfig['page_bg_p3'];
                } elseif ($pIdx % 2 != 0) {
                    $bgId = $albumConfig['page_bg_p1'];
                } elseif ($pIdx % 2 == 0 && $pIdx >= 4) {
                    $bgId = $albumConfig['page_bg_p2'];
                }
                $bgUrlThumb = getDriveUrl($pdo, $bgId, 800);
            ?>
                <div class="page" data-density="soft">
                    <?php if($bgUrlThumb): ?>
                        <img src="<?php echo $bgUrlThumb; ?>" 
                             class="absolute inset-0 w-full h-full object-fill z-0" 
                             width="450" height="600"
                             loading="lazy" 
                             decoding="async">
                    <?php endif; ?>
                    <div class="page-content-wrapper relative z-10">
                        <div class="drag-hint">Arrastre</div>
                        
                        <?php 
                        $mosaicPairs = [2 => 3, 34 => 35, 38 => 39];
                        $hasMosaicPage = false;
                        foreach($pData['stickers'] as $stCheck) {
                            if(isset($mosaicPairs[$stCheck['number']])) $hasMosaicPage = true;
                        }
                        ?>
                        <div class="sticker-grid <?php echo $hasMosaicPage ? 'mosaic-page' : ''; ?>">
                            <?php foreach ($pData['stickers'] as $st): 
                                $stuck = isset($userInv[$st['id']]) && $userInv[$st['id']]['is_stuck'] == 1;
                                $imgUrlFull = getDriveUrl($pdo, $st['external_url']);
                                $imgUrlThumb = getDriveUrl($pdo, $st['external_url'], 400);
                                $stData = htmlspecialchars(json_encode($st));
                                $rarity = $st['rarity'];
                                $rot = (($st['id'] * 123) % 7) - 3; 

                                // Lógica de clases de mosaico
                                $mosaicClass = '';
                                if (isset($mosaicPairs[$st['number']])) $mosaicClass = 'mosaic-left';
                                foreach($mosaicPairs as $left => $right) {
                                    if($st['number'] == $right) $mosaicClass = 'mosaic-right';
                                }
                            ?>
                                <div class="slot slot-rarity-<?php echo $rarity; ?>" data-number="<?php echo $st['number']; ?>">
                                    <?php if($stuck): ?>
                                        <div class="sticker-body frame-<?php echo $rarity; ?> <?php echo $mosaicClass; ?>" data-rotation="<?php echo $rot; ?>" style="--rotation: <?php echo $rot; ?>deg" onclick='handleCardClick(event, <?php echo $stData; ?>, "<?php echo $imgUrlFull; ?>")'>
                                            <div class="sticker-content">
                                                <?php if($rarity === 'gold'): ?><div class="gold-aura"></div><?php endif; ?>
                                                <?php if($rarity === 'holo' || $rarity === 'gold' || $rarity === 'rare'): ?>
                                                    <div class="overlay-<?php echo $rarity; ?>"></div>
                                                <?php endif; ?>
                                                <?php if($rarity === 'gold'): ?><div class="gold-sweep"></div><?php endif; ?>
                                                <img src="<?php echo $imgUrlThumb; ?>" 
                                                     class="sticker-stuck <?php echo ($rarity === 'gold') ? 'gold-filter' : ''; ?>" 
                                                     width="150" height="200"
                                                     loading="lazy" 
                                                     decoding="async">
                                            </div>
                                        </div>
                                    <?php else: ?>
                                        <span><?php echo $st['number']; ?></span>
                                    <?php endif; ?>
                                </div>
                            <?php endforeach; ?>
                        </div>
                        <div class="page-number">PÁGINA <?php echo $pIdx; ?></div>
                    </div>
                </div>
            <?php endif; ?>

        <?php endforeach; ?>
    </div>
</div>

<?php renderGlobalAssets($pdo); ?>