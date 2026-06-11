/* ═══════════════════════════════════════
   Guide Module — Render personalized guide
   ═══════════════════════════════════════ */

const Guide = (() => {
    let currentTab = 'recommended';
    let currentFoodTier = 0;
    let userProfile = null;
    let lastScreen = 'guide';

    // ── Translation helper ──
    function t(key) {
        const lang = App.getCurrentLang();
        return (translations[lang] && translations[lang][key]) || translations.tr[key] || key;
    }

    // ── Get localized field ──
    function loc(obj, field) {
        if (!obj || !obj[field]) return '';
        const lang = App.getCurrentLang();
        if (typeof obj[field] === 'object') {
            return obj[field][lang] || obj[field].en || obj[field].tr || '';
        }
        return obj[field];
    }

    // ── Get localized name ──
    function getName(item) {
        if (item.name && typeof item.name === 'object') {
            const lang = App.getCurrentLang();
            return item.name[lang] || item.name.en || item.name.tr || '';
        }
        return item.name || '';
    }

    // ── Set profile from quiz ──
    function setProfile(profile) {
        userProfile = profile;
    }

    // ── Initialize guide view ──
    function init() {
        currentTab = 'recommended';
        currentFoodTier = 0;
        updateTabs();
        renderPlaces();

        // Set subtitle
        const subtitle = document.getElementById('guide-subtitle');
        if (userProfile) {
            const profileName = t(`profile_${userProfile.profile.key}_name`);
            subtitle.textContent = `${t('guide_subtitle_prefix')} ${profileName}`;
        }
    }

    // ── Switch main tab ──
    function switchTab(tab) {
        currentTab = tab;
        currentFoodTier = 0;
        updateTabs();
        renderPlaces();
    }

    // ── Filter food by tier ──
    function filterFood(tier) {
        currentFoodTier = tier;

        // Update food tab active states
        document.querySelectorAll('.food-tab').forEach(btn => {
            btn.classList.toggle('active', parseInt(btn.dataset.tier) === tier);
        });

        renderPlaces();
    }

    // ── Update tab states ──
    function updateTabs() {
        // Main tabs
        document.querySelectorAll('.guide-tabs .tab').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === currentTab);
        });

        // Show/hide food subtabs
        const foodTabs = document.getElementById('food-tabs');
        if (currentTab === 'food') {
            foodTabs.classList.add('visible');
            foodTabs.style.display = 'flex';
        } else {
            foodTabs.classList.remove('visible');
            foodTabs.style.display = 'none';
        }

        // Reset food tab active
        document.querySelectorAll('.food-tab').forEach(btn => {
            btn.classList.toggle('active', parseInt(btn.dataset.tier) === currentFoodTier);
        });
    }

    // ── Get filtered places ──
    function getFilteredPlaces() {
        switch (currentTab) {
            case 'recommended':
                return getRecommendedPlaces();
            case 'popular':
                return getPopularPlaces();
            case 'food':
                return getFoodPlaces();
            case 'all':
                return getAllPlaces();
            default:
                return [];
        }
    }

    // ── Recommended places based on profile ──
    function getRecommendedPlaces() {
        if (!userProfile) return getAllPlaces();

        const categoryIndex = userProfile.profileIndex;
        const tagMap = ['history', 'traditional', 'nature', 'shopping', 'adventure'];
        const primaryTag = tagMap[categoryIndex];

        // Score each place based on profile match
        const allItems = [...places, ...foodPlaces];
        const scored = allItems.map(item => {
            let score = 0;
            if (item.tags) {
                item.tags.forEach(tag => {
                    if (tag === primaryTag) score += 3;
                    // Secondary matches
                    const scores = userProfile.rawScores;
                    tagMap.forEach((t, i) => {
                        if (tag === t || tag.includes(t.substring(0, 4))) {
                            score += scores[i] * 0.1;
                        }
                    });
                });
            }
            // Boost by rating
            score += (item.rating || 0) * 0.5;
            return { ...item, matchScore: score };
        });

        scored.sort((a, b) => b.matchScore - a.matchScore);
        return scored.slice(0, 15);
    }

    // ── Popular places ──
    function getPopularPlaces() {
        const sorted = [...places].sort((a, b) =>
            (a.popularityRank || 99) - (b.popularityRank || 99)
        );
        return sorted;
    }

    // ── Food places with tier filter ──
    function getFoodPlaces() {
        if (currentFoodTier === 0) return [...foodPlaces];
        return foodPlaces.filter(p => p.tier === currentFoodTier);
    }

    // ── All places ──
    function getAllPlaces() {
        return [...places, ...foodPlaces];
    }

    // ── Render places grid ──
    function renderPlaces() {
        const grid = document.getElementById('places-grid');
        const items = getFilteredPlaces();

        if (items.length === 0) {
            grid.innerHTML = '<p style="text-align:center; color: var(--text-tertiary); padding: 40px;">No places found</p>';
            return;
        }

        grid.innerHTML = items.map((item, index) => createPlaceCard(item, index)).join('');
    }

    // ── Create place card HTML ──
    function createPlaceCard(item, index) {
        const name = getName(item);
        const shortDesc = loc(item, 'shortDesc');
        const isFood = item.tier !== undefined;
        const category = isFood ? 'food' : (item.category || 'historical');
        const priceSymbol = '₺'.repeat(item.priceLevel || 1);
        const tierLabels = { 1: t('food_restaurant'), 2: t('food_fastfood'), 3: t('food_cafe'), 4: t('food_dessert') };

        const categoryLabel = isFood
            ? (tierLabels[item.tier] || '')
            : t(`cat_${getCategoryTranslationKey(category)}`);

        const animDelay = Math.min(index * 0.05, 0.5);

        return `
        <div class="place-card" onclick="Guide.showDetail('${item.id}', ${isFood})" style="animation-delay: ${animDelay}s">
            <div class="card-image" style="background: ${item.image || 'var(--bg-secondary)'}">
                ${isFood
                    ? `<span class="card-tier tier-${item.tier}">${item.emoji || ''} ${tierLabels[item.tier] || ''}</span>`
                    : `<span class="card-category cat-${category}">${categoryLabel}</span>`
                }
                <span class="card-rating">⭐ ${(item.rating || 0).toFixed(1)}</span>
            </div>
            <div class="card-body">
                <div class="card-name">${name}</div>
                <div class="card-district">📍 ${item.district || ''}</div>
                <div class="card-desc">${shortDesc}</div>
            </div>
            <div class="card-footer">
                <span class="card-price">${item.priceLevel === 0 ? t('detail_free') : priceSymbol}</span>
                <span class="card-arrow">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z"/></svg>
                </span>
            </div>
        </div>`;
    }

    // ── Map category to translation key ──
    function getCategoryTranslationKey(cat) {
        const map = {
            'historical': 'history',
            'nature': 'nature',
            'shopping': 'shopping',
            'nightlife': 'shopping',
            'food': 'food'
        };
        return map[cat] || 'history';
    }

    // ── Show detail screen ──
    function showDetail(id, isFood) {
        const item = isFood
            ? foodPlaces.find(p => p.id === id)
            : places.find(p => p.id === id);

        if (!item) return;

        lastScreen = 'guide';
        renderDetail(item, isFood);
        App.switchScreen('detail');
    }

    // ── Render detail view ──
    function renderDetail(item, isFood) {
        const lang = App.getCurrentLang();

        // Hero image
        document.getElementById('detail-hero-img').style.background = item.image || 'var(--bg-secondary)';

        // Category badge
        const category = isFood ? 'food' : (item.category || 'historical');
        const tierLabels = { 1: t('food_restaurant'), 2: t('food_fastfood'), 3: t('food_cafe'), 4: t('food_dessert') };
        const catBadge = document.getElementById('detail-category');
        catBadge.textContent = isFood ? `${item.emoji || ''} ${tierLabels[item.tier]}` : t(`cat_${getCategoryTranslationKey(category)}`);

        // Name & district
        document.getElementById('detail-name').textContent = getName(item);
        document.getElementById('detail-district').textContent = item.district || '';

        // Meta
        document.getElementById('detail-rating').textContent = `⭐ ${(item.rating || 0).toFixed(1)}`;
        const priceSymbol = item.priceLevel === 0 ? t('detail_free') : '₺'.repeat(item.priceLevel || 1);
        document.getElementById('detail-price').textContent = priceSymbol;

        // Popularity
        const popEl = document.getElementById('detail-popularity');
        if (item.popularityRank) {
            popEl.textContent = item.popularityRank <= 5 ? `🔥 ${t('detail_very_popular')}` : `📈 ${t('detail_popular')}`;
        } else {
            popEl.textContent = `📈 ${t('detail_popular')}`;
        }

        // Description
        document.getElementById('detail-description').textContent = loc(item, 'longDesc');

        // Practical info
        const infoGrid = document.getElementById('detail-info-grid');
        let infoHTML = '';

        if (item.visitHours) {
            const hours = typeof item.visitHours === 'object' ? (item.visitHours[lang] || item.visitHours.tr) : item.visitHours;
            infoHTML += createInfoCard('🕐', t('detail_hours'), hours);
        }
        if (item.entranceFee) {
            const fee = typeof item.entranceFee === 'object' ? (item.entranceFee[lang] || item.entranceFee.tr) : item.entranceFee;
            infoHTML += createInfoCard('🎫', t('detail_entrance'), fee);
        }
        if (item.transport) {
            const trans = typeof item.transport === 'object' ? (item.transport[lang] || item.transport.tr) : item.transport;
            infoHTML += createInfoCard('🚇', t('detail_transport'), trans);
        }
        if (isFood && item.cuisine) {
            const cuisine = typeof item.cuisine === 'object' ? (item.cuisine[lang] || item.cuisine.tr) : item.cuisine;
            infoHTML += createInfoCard('👨‍🍳', t('food_restaurant'), cuisine);
        }

        infoGrid.innerHTML = infoHTML;
        document.getElementById('detail-info-section').style.display = infoHTML ? 'block' : 'none';

        // Signature dishes (food only)
        const foodSection = document.getElementById('detail-food-section');
        if (isFood && item.signatureDishes) {
            const dishes = typeof item.signatureDishes === 'object'
                ? (item.signatureDishes[lang] || item.signatureDishes.tr || [])
                : [];
            foodSection.style.display = 'block';
            document.getElementById('detail-signature').innerHTML = dishes
                .map(d => `<span class="signature-tag">${d}</span>`)
                .join('');
        } else {
            foodSection.style.display = 'none';
        }

        // Tips
        const tipsSection = document.getElementById('detail-tips-section');
        if (item.tips) {
            const tips = typeof item.tips === 'object' && Array.isArray(item.tips[lang])
                ? item.tips[lang]
                : (item.tips.tr || []);
            if (tips.length > 0) {
                tipsSection.style.display = 'block';
                document.getElementById('detail-tips').innerHTML = tips
                    .map(tip => `<div class="tip-item"><span class="tip-icon">💡</span><span>${tip}</span></div>`)
                    .join('');
            } else {
                tipsSection.style.display = 'none';
            }
        } else {
            tipsSection.style.display = 'none';
        }

        // Nearby places
        renderNearbyPlaces(item);
    }

    // ── Create info card ──
    function createInfoCard(icon, label, value) {
        return `
        <div class="info-card">
            <span class="info-card-icon">${icon}</span>
            <div class="info-card-content">
                <span class="info-card-label">${label}</span>
                <span class="info-card-value">${value}</span>
            </div>
        </div>`;
    }

    // ── Render nearby places ──
    function renderNearbyPlaces(currentItem) {
        const nearbyGrid = document.getElementById('nearby-grid');
        const allPlaces = [...places, ...foodPlaces];

        // Find places in the same district or with similar tags
        const nearby = allPlaces
            .filter(p => p.id !== currentItem.id)
            .map(p => {
                let score = 0;
                if (p.district === currentItem.district) score += 3;
                if (p.tags && currentItem.tags) {
                    p.tags.forEach(tag => {
                        if (currentItem.tags.includes(tag)) score += 1;
                    });
                }
                return { ...p, nearbyScore: score };
            })
            .sort((a, b) => b.nearbyScore - a.nearbyScore)
            .slice(0, 5);

        nearbyGrid.innerHTML = nearby.map(p => {
            const isFood = p.tier !== undefined;
            return `
            <div class="nearby-card" onclick="Guide.showDetail('${p.id}', ${isFood})">
                <div class="nearby-img" style="background: ${p.image || 'var(--bg-secondary)'}"></div>
                <div class="nearby-info">
                    <div class="nearby-name">${getName(p)}</div>
                    <div class="nearby-district">📍 ${p.district}</div>
                </div>
            </div>`;
        }).join('');
    }

    // ── Close detail, go back to guide ──
    function closeDetail() {
        App.switchScreen(lastScreen);
    }

    // ── Refresh for language change ──
    function refreshLanguage() {
        if (document.getElementById('screen-guide').classList.contains('active')) {
            init();
        }
    }

    // ── Public API ──
    return {
        init,
        setProfile,
        switchTab,
        filterFood,
        showDetail,
        closeDetail,
        renderPlaces,
        refreshLanguage
    };
})();
