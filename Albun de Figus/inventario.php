<!-- BANDEJA DE INVENTARIO (PRESERVADA) -->
<section class="inventory-tray">
    <div class="flex justify-between items-center mb-2 px-2">
        <h3 class="text-[10px] font-black uppercase tracking-widest text-cyan-400">Figuritas Disponibles</h3>
        <span class="text-[9px] text-gray-500 font-bold"><?php echo count($looseStickers); ?> DISPONIBLES</span>
    </div>
    <div class="loose-container" id="loose-list">
        <?php foreach ($looseStickers as $loose): 
            $imgUrlThumb = getDriveUrl($pdo, $loose['external_url'], 400);
        ?>
            <div class="loose-card" onpointerdown="startCustomDrag(event, this)" 
                 data-id="<?php echo $loose['id']; ?>" 
                 data-number="<?php echo $loose['number']; ?>" 
                 data-rarity="<?php echo $loose['rarity']; ?>"
                 data-name="<?php echo htmlspecialchars($loose['name']); ?>"
                 data-description="<?php echo htmlspecialchars($loose['description'] ?? ''); ?>">
                <div class="loose-tag"><?php echo $loose['number']; ?></div>
                <div class="sticker-body frame-<?php echo $loose['rarity']; ?>">
                    <div class="sticker-content">
                        <?php if($loose['rarity'] === 'gold'): ?><div class="gold-aura"></div><?php endif; ?>
                        <?php if($loose['rarity'] === 'holo' || $loose['rarity'] === 'gold' || $loose['rarity'] === 'rare'): ?>
                            <div class="overlay-<?php echo $loose['rarity']; ?>"></div>
                        <?php endif; ?>
                        <?php if($loose['rarity'] === 'gold'): ?><div class="gold-sweep"></div><?php endif; ?>
                        <img src="<?php echo $imgUrlThumb; ?>" 
                             class="sticker-stuck <?php echo ($loose['rarity'] === 'gold') ? 'gold-filter' : ''; ?>"
                             loading="lazy"
                             decoding="async">
                    </div>
                </div>
            </div>
        <?php endforeach; ?>
    </div>
</section>